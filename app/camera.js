// app/camera.js
import React, { useRef, useState } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, ActivityIndicator, Alert, Platform, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '../utils/theme';
import { generateRecipeFromImage } from '../services/geminiService';
import { addRecipeToHistory } from '../utils/recipeHistory';
import { getRecipePreferences } from '../utils/preferencesStorage';

export default function CameraScreen() {
  const [permission, requestPermission] = useCameraPermissions();
  const cameraRef = useRef(null);
  const router = useRouter();
  const [isProcessing, setIsProcessing] = useState(false);
  
  // NEW: State to hold the captured image so we can freeze the screen
  const [capturedImage, setCapturedImage] = useState(null);

  if (!permission) return <View style={styles.container} />; 

  if (!permission.granted) {
    return (
      <SafeAreaView style={styles.permissionContainer}>
        <View style={styles.iconCircle}>
          <Ionicons name="camera" size={40} color={theme.colors.primary} />
        </View>
        <Text style={styles.permissionTitle}>Camera Access</Text>
        <Text style={styles.permissionText}>
          RecipeAI needs to see your ingredients to conjure up a delicious recipe!
        </Text>
        <TouchableOpacity style={styles.permissionButton} onPress={requestPermission}>
          <Text style={styles.permissionButtonText}>Grant Permission</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  const takePicture = async () => {
    if (cameraRef.current) {
      setIsProcessing(true);
      
      try {
        if (Platform.OS === 'web' && typeof window !== 'undefined' && !window.isSecureContext) {
          throw new Error('Camera scanning in a browser needs http://localhost or an HTTPS address. Do not use a local network IP address.');
        }

        // 1. Take picture
        const photo = await cameraRef.current.takePictureAsync({ base64: true, quality: 0.5 });
        
        // FREEZE THE SCREEN: Immediately show the captured photo to the user
        if (photo?.uri) {
          setCapturedImage(photo.uri);
        }

        let base64Image = photo?.base64;

        // 2. Cross-platform handling for Web Blob URIs vs Mobile Data URIs
        if (!base64Image && photo?.uri) {
          if (photo.uri.startsWith('data:image')) {
            base64Image = photo.uri.replace(/^data:image\/[^;]+;base64,/, '');
          } else if (photo.uri.startsWith('blob:')) {
            const response = await fetch(photo.uri);
            const blob = await response.blob();
            base64Image = await new Promise((resolve, reject) => {
              const reader = new FileReader();
              reader.onloadend = () => {
                const result = reader.result;
                resolve(result.replace(/^data:image\/[^;]+;base64,/, ''));
              };
              reader.onerror = reject;
              reader.readAsDataURL(blob);
            });
          }
        }

        if (!photo || !base64Image) {
          throw new Error("Camera failed to capture image data.");
        }

        console.log("Photo captured successfully. Sending to Gemini...");
        
        // 3. Send to Gemini service
        const preferences = await getRecipePreferences();
        const generatedRecipe = await generateRecipeFromImage(base64Image, preferences);
        
        if (!generatedRecipe) {
          setIsProcessing(false);
          setCapturedImage(null); // Unfreeze if it fails
          Alert.alert('Generation Failed', 'AI chef could not create a recipe from this image. Check your console logs.');
          return;
        }

        await addRecipeToHistory(generatedRecipe.recipes[0]);

        setIsProcessing(false);
        setCapturedImage(null); // Clear the image for the next time they open the camera
        
        router.push({
          pathname: '/recipe',
          params: { recipeData: JSON.stringify(generatedRecipe) }
        });

      } catch (error) {
        console.error("Camera AI Error:", error);
        setIsProcessing(false);
        setCapturedImage(null); // Unfreeze camera so they can try again
        Alert.alert("AI Error", error.message || "Failed to identify ingredients.");
      }
    }
  };

  return (
    <View style={styles.container}>
      {/* NEW: If we have a captured image, show it. Otherwise, show the live camera feed */}
      {capturedImage ? (
        <Image source={{ uri: capturedImage }} style={styles.camera} resizeMode="cover" />
      ) : (
        <CameraView style={styles.camera} facing="back" ref={cameraRef} />
      )}

      <SafeAreaView edges={['top']} style={styles.topBar}>
        <TouchableOpacity
          style={styles.closeButton}
          onPress={() => {
            // Prevent backing out while processing, or clear the image if needed
            if (isProcessing) return; 
            
            if (Platform.OS === 'web' && typeof window !== 'undefined' && window.history.length <= 1) {
              router.replace('/');
            } else {
              router.back();
            }
          }}
        >
          <Ionicons name="close" size={28} color="#FFFFFF" />
        </TouchableOpacity>
      </SafeAreaView>

      <SafeAreaView edges={['bottom']} style={styles.bottomBar}>
        {isProcessing ? (
          <View style={styles.processingContainer}>
            <ActivityIndicator size="large" color={theme.colors.accent} />
            <Text style={styles.processingText}>Ai Chef is thinking...</Text>
          </View>
        ) : (
          <TouchableOpacity style={styles.captureButton} onPress={takePicture}>
            <View style={styles.captureInnerCircle} />
          </TouchableOpacity>
        )}
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000' },
  camera: { flex: 1, width: '100%', height: '100%' },
  permissionContainer: { flex: 1, backgroundColor: theme.colors.background, justifyContent: 'center', alignItems: 'center', padding: 30 },
  iconCircle: { width: 80, height: 80, borderRadius: 40, backgroundColor: theme.colors.cardPrimary, justifyContent: 'center', alignItems: 'center', marginBottom: 20 },
  permissionTitle: { fontSize: 24, fontWeight: 'bold', color: theme.colors.textDark, marginBottom: 10 },
  permissionText: { textAlign: 'center', fontSize: 16, color: theme.colors.textMuted, marginBottom: 30, lineHeight: 24 },
  permissionButton: { backgroundColor: theme.colors.primary, paddingVertical: 16, paddingHorizontal: 40, borderRadius: theme.borderRadius.md, width: '100%', alignItems: 'center' },
  permissionButtonText: { color: '#FFFFFF', fontWeight: 'bold', fontSize: 16 },
  topBar: { position: 'absolute', top: 0, left: 20, zIndex: 10 },
  closeButton: { width: 44, height: 44, borderRadius: 22, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'center', alignItems: 'center' },
  bottomBar: { position: 'absolute', bottom: 0, left: 0, right: 0, height: 150, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'center', alignItems: 'center', paddingBottom: 20 },
  captureButton: { width: 76, height: 76, borderRadius: 38, borderWidth: 4, borderColor: '#FFFFFF', justifyContent: 'center', alignItems: 'center' },
  captureInnerCircle: { width: 60, height: 60, borderRadius: 30, backgroundColor: '#FFFFFF' },
  processingContainer: { alignItems: 'center' },
  processingText: { color: theme.colors.accent, fontWeight: 'bold', marginTop: 10, fontSize: 16 }
});
