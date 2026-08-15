import { useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

import {
  CameraView,
  useCameraPermissions,
} from 'expo-camera';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

import { theme } from '../utils/theme';

import {
  generateRecipeFromImage,
} from '../services/geminiService';

import {
  addRecipeToHistory,
} from '../utils/recipeHistory';

import {
  getRecipePreferences,
} from '../utils/preferencesStorage';

export default function CameraScreen() {
  const [permission, requestPermission] =
    useCameraPermissions();

  const cameraRef = useRef(null);
  const router = useRouter();

  const [isProcessing, setIsProcessing] =
    useState(false);

  const [capturedImage, setCapturedImage] =
    useState(null);

  if (!permission) {
    return (
      <View style={styles.container}>
        <ActivityIndicator
          size="large"
          color={theme.colors.accent}
        />
      </View>
    );
  }

  if (!permission.granted) {
    return (
      <SafeAreaView
        style={styles.permissionContainer}
      >
        <View style={styles.iconCircle}>
          <Ionicons
            name="camera"
            size={40}
            color={theme.colors.primary}
          />
        </View>

        <Text style={styles.permissionTitle}>
          Camera Access
        </Text>

        <Text style={styles.permissionText}>
          RecipeAI needs to see your ingredients
          to conjure up a delicious recipe!
        </Text>

        <TouchableOpacity
          style={styles.permissionButton}
          onPress={requestPermission}
          activeOpacity={0.8}
        >
          <Text style={styles.permissionButtonText}>
            Grant Permission
          </Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  const blobUriToBase64 = async (uri) => {
    const response = await fetch(uri);

    if (!response.ok) {
      throw new Error(
        'Failed to read captured image.'
      );
    }

    const blob = await response.blob();

    return await new Promise(
      (resolve, reject) => {
        const reader = new FileReader();

        reader.onloadend = () => {
          try {
            const result = reader.result;

            if (
              typeof result !== 'string'
            ) {
              reject(
                new Error(
                  'Could not convert image to base64.'
                )
              );
              return;
            }

            const rawBase64 =
              result.replace(
                /^data:image\/[^;]+;base64,/,
                ''
              );

            resolve(rawBase64);
          } catch (error) {
            reject(error);
          }
        };

        reader.onerror = () => {
          reject(
            new Error(
              'Failed to read image data.'
            )
          );
        };

        reader.readAsDataURL(blob);
      }
    );
  };

  const normalizeBase64 = async (photo) => {
    if (!photo) {
      throw new Error(
        'Camera failed to capture an image.'
      );
    }

    if (photo.base64) {
      let base64 = photo.base64;

      if (
        base64.startsWith(
          'data:image'
        )
      ) {
        console.log(
          '[CAMERA] Removing data URI prefix from photo.base64'
        );

        base64 = base64.replace(
          /^data:image\/[^;]+;base64,/,
          ''
        );
      }

      return base64;
    }

    if (!photo.uri) {
      throw new Error(
        'Camera returned no image data.'
      );
    }

    if (
      photo.uri.startsWith(
        'data:image'
      )
    ) {
      return photo.uri.replace(
        /^data:image\/[^;]+;base64,/,
        ''
      );
    }

    if (
      photo.uri.startsWith('blob:')
    ) {
      return await blobUriToBase64(
        photo.uri
      );
    }

    throw new Error(
      'Unsupported camera image format.'
    );
  };

  const takePicture = async () => {
    if (
      !cameraRef.current ||
      isProcessing
    ) {
      return;
    }

    setIsProcessing(true);

    try {
      if (
        Platform.OS === 'web' &&
        typeof window !== 'undefined' &&
        !window.isSecureContext
      ) {
        throw new Error(
          'Camera scanning in a browser needs http://localhost or an HTTPS address.'
        );
      }

      console.log(
        '[CAMERA] Taking picture...'
      );

      const photo =
        await cameraRef.current.takePictureAsync({
          base64: true,
          quality: 0.5,
        });

      if (!photo) {
        throw new Error(
          'Camera failed to capture image.'
        );
      }

      if (photo.uri) {
        setCapturedImage(
          photo.uri
        );
      }

      const base64Image =
        await normalizeBase64(
          photo
        );

      if (!base64Image) {
        throw new Error(
          'Camera failed to capture image data.'
        );
      }

      console.log(
        '[CAMERA] Image captured successfully'
      );

      console.log(
        '[CAMERA] Base64 length:',
        base64Image.length
      );

      console.log(
        '[CAMERA] Base64 starts with:',
        base64Image.substring(0, 30)
      );

      const preferences =
        await getRecipePreferences();

      console.log(
        '[CAMERA] Sending image to Gemini...'
      );

      const generatedRecipe =
        await generateRecipeFromImage(
          base64Image,
          preferences
        );

      if (!generatedRecipe) {
        setIsProcessing(false);

        Alert.alert(
          'Generation Failed',
          'AI chef could not create a recipe from this image. Check the browser console.'
        );

        return;
      }

      if (
        generatedRecipe.recipes &&
        generatedRecipe.recipes.length > 0
      ) {
        await addRecipeToHistory(
          generatedRecipe
        );
      }

      setIsProcessing(false);

      router.push({
        pathname: '/recipe',
        params: {
          recipeData:
            JSON.stringify(
              generatedRecipe
            ),
        },
      });
    } catch (error) {
      console.error(
        '[CAMERA] AI ERROR:',
        error
      );

      setIsProcessing(false);

      Alert.alert(
        'AI Error',
        error?.message ||
        'Failed to identify ingredients.'
      );
    }
  };

  return (
    <View style={styles.container}>
      {capturedImage ? (
        <Image
          source={{
            uri: capturedImage,
          }}
          style={styles.camera}
          resizeMode="cover"
        />
      ) : (
        <CameraView
          style={styles.camera}
          facing="back"
          ref={cameraRef}
        />
      )}

      <SafeAreaView
        edges={['top']}
        style={styles.topBar}
      >
        <TouchableOpacity
          style={styles.closeButton}
          onPress={() => {
            if (isProcessing) {
              return;
            }

            if (
              Platform.OS === 'web' &&
              typeof window !== 'undefined' &&
              window.history.length <= 1
            ) {
              router.replace('/');
            } else {
              router.back();
            }
          }}
          activeOpacity={0.8}
        >
          <Ionicons
            name="close"
            size={28}
            color="#FFFFFF"
          />
        </TouchableOpacity>
      </SafeAreaView>

      <SafeAreaView
        edges={['bottom']}
        style={styles.bottomBar}
      >
        {isProcessing ? (
          <View
            style={
              styles.processingContainer
            }
          >
            <ActivityIndicator
              size="large"
              color={theme.colors.accent}
            />

            <Text
              style={
                styles.processingText
              }
            >
              Ai Chef is thinking...
            </Text>
          </View>
        ) : (
          <TouchableOpacity
            style={[
              styles.captureButton,
              capturedImage &&
              styles.captureButtonDisabled,
            ]}
            onPress={takePicture}
            disabled={
              !!capturedImage
            }
            activeOpacity={0.8}
          >
            <View
              style={
                styles.captureInnerCircle
              }
            />
          </TouchableOpacity>
        )}
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },

  camera: {
    flex: 1,
    width: '100%',
    height: '100%',
  },

  permissionContainer: {
    flex: 1,
    backgroundColor:
      theme.colors.background,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 30,
  },

  iconCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor:
      theme.colors.cardPrimary,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },

  permissionTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: theme.colors.textDark,
    marginBottom: 10,
  },

  permissionText: {
    textAlign: 'center',
    fontSize: 16,
    color: theme.colors.textMuted,
    marginBottom: 30,
    lineHeight: 24,
  },

  permissionButton: {
    backgroundColor:
      theme.colors.primary,
    paddingVertical: 16,
    paddingHorizontal: 40,
    borderRadius:
      theme.borderRadius.md,
    width: '100%',
    alignItems: 'center',
  },

  permissionButtonText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 16,
  },

  topBar: {
    position: 'absolute',
    top: 0,
    left: 20,
    zIndex: 10,
  },

  closeButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor:
      'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    alignItems: 'center',
  },

  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 150,
    backgroundColor:
      'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingBottom: 20,
  },

  captureButton: {
    width: 76,
    height: 76,
    borderRadius: 38,
    borderWidth: 4,
    borderColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
  },

  captureButtonDisabled: {
    opacity: 0.45,
  },

  captureInnerCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#FFFFFF',
  },

  processingContainer: {
    alignItems: 'center',
  },

  processingText: {
    color: theme.colors.accent,
    fontWeight: 'bold',
    marginTop: 10,
    fontSize: 16,
  },
});