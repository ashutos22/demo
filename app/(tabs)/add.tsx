import { useState } from 'react';
import {
  StyleSheet,
  TextInput,
  SafeAreaView,
  View,
  Switch,
  Button,
  Platform,
  Image,
  Alert,
} from 'react-native';
import ModalSelector from 'react-native-modal-selector';
import * as ImagePicker from 'expo-image-picker';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import DateTimePicker, {
  DateTimePickerEvent,
} from '@react-native-community/datetimepicker';
import AWS from 'aws-sdk';
import { router } from 'expo-router';

import { addDoc, collection } from 'firebase/firestore';
import { db } from '@/firebaseConfig';

AWS.config.update({
  accessKeyId: process.env.EXPO_PUBLIC_AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.EXPO_PUBLIC_SECRET_AWS_ACCESS_KEY,
  region: process.env.EXPO_PUBLIC_AWS_REGION,
});

const s3 = new AWS.S3();

const uploadFileToS3 = (bucketName: string, fileName: string, file: Blob) => {
  const params = {
    Bucket: bucketName,
    Key: fileName,
    Body: file,
  };

  return s3.upload(params).promise();
};

interface UserData {
  firstName: string;
  lastName: string;
  gender: string;
  dob: Date;
  role: string;
}

export default function AddScreen() {
  const [userData, setUserData] = useState<UserData>({
    firstName: '',
    lastName: '',
    gender: 'male',
    dob: new Date(),
    role: '',
  });
  const [show, setShow] = useState<boolean>(false);
  const [image, setImage] = useState<string | null>(null);
  const [isSubmiting, setIsSubmiting] = useState<boolean>(false);

  const updateUserData = (
    key: string,
    value: string | Date | number | undefined,
  ) => {
    setIsSubmiting(false);
    setUserData((userData) => ({
      ...userData,
      [key]: value,
    }));
  };

  const updateGender = () => {
    const gender = userData.gender === 'male' ? 'female' : 'male';
    updateUserData('gender', gender);
  };

  const onChange = (event: DateTimePickerEvent, selectedDate?: Date) => {
    setShow(false);
    updateUserData('dob', selectedDate);
  };

  const pickImage = async () => {
    // No permissions request is necessary for launching the image library
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images', 'videos'],
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    if (!result.canceled) {
      setImage(result.assets[0].uri);
    }
  };

  const uploadImage = async () => {
    if (image) {
      try {
        const bucketName = process.env.EXPO_PUBLIC_AWS_BUCKET;

        console.log(image, 'image');

        const name = image.split('/')[image.split('/').length - 1];

        const fileName = `${Date.now().toLocaleString()}${name}`;

        try {
          const fileData = await fetch(image).then((response) =>
            response.blob(),
          );

          console.log(fileData, 'fileData');
          await uploadFileToS3(bucketName!, fileName, fileData);
          console.log('File uploaded: ', fileName);
          return fileName;
        } catch (error) {
          console.log('Error uploading file', error);
          Alert.alert('Error', 'File upload failed');
        }
      } catch (error) {
        Alert.alert('Error');
      }
    }
  };

  const uploadUserData = async (fileName: string | undefined) => {
    if (fileName) {
      try {
        const docRef = await addDoc(collection(db, 'users'), {
          firstName: userData.firstName,
          lastName: userData.lastName,
          gender: userData.gender,
          dob: `${userData.dob.getDate()}-${
            userData.dob.getMonth() + 1
          }-${userData.dob.getFullYear()}`,
          role: userData.role,
          profilePicturePath: `https://${process.env.EXPO_PUBLIC_AWS_BUCKET}.s3.${process.env.EXPO_PUBLIC_AWS_REGION}.amazonaws.com/${fileName}`,
        });

        console.log('Document written with ID: ', docRef.id);
      } catch (e) {
        console.error('Error adding document: ', e);
      }
    }
  };

  const submitHandler = async () => {
    setIsSubmiting(true);
    //const fileName = await uploadImage();
    await uploadUserData('fileName');
    setUserData({
      firstName: '',
      lastName: '',
      gender: 'male',
      dob: new Date(),
      role: '',
    });
    setImage(null);
    setIsSubmiting(false);
    router.replace('/(tabs)');
  };

  return (
    <SafeAreaView style={styles.container}>
      <ThemedView>
        <View style={styles.row}>
          <ThemedText style={styles.label}>First Name:</ThemedText>
          <TextInput
            style={styles.input}
            autoCorrect={false}
            autoCapitalize="none"
            value={userData.firstName}
            onChangeText={(text) => updateUserData('firstName', text)}
          />
        </View>
        <View style={styles.row}>
          <ThemedText style={styles.label}>Last Name:</ThemedText>
          <TextInput
            style={styles.input}
            autoCorrect={false}
            autoCapitalize="none"
            value={userData.lastName}
            onChangeText={(text) => updateUserData('lastName', text)}
          />
        </View>
        <View style={styles.row}>
          <ThemedText style={styles.label}>Gender:</ThemedText>
          <View style={styles.gender}>
            <ThemedText style={styles.label}>Female</ThemedText>
            <Switch
              trackColor={{ false: '#767577', true: '#81b0ff' }}
              thumbColor={userData.gender === 'male' ? '#f5dd4b' : '#f4f3f4'}
              ios_backgroundColor="#3e3e3e"
              onValueChange={updateGender}
              value={userData.gender === 'male'}
            />
            <ThemedText style={styles.label}>Male</ThemedText>
          </View>
        </View>
        <View style={styles.row}>
          <ThemedText style={styles.label}>Date of Birth:</ThemedText>
          {!show && Platform.OS !== 'ios' && (
            <ThemedText onPress={() => setShow((show) => !show)}>
              <ThemedText style={styles.date}>
                {`${userData.dob.getDate()} ${userData.dob.toLocaleString(
                  'default',
                  { month: 'short' },
                )} ${userData.dob.getFullYear()}`.toLocaleString() ??
                  'select date'}
              </ThemedText>
            </ThemedText>
          )}
          {(show || Platform.OS === 'ios') && (
            <DateTimePicker
              testID="dateTimePicker"
              value={userData.dob}
              mode="date"
              is24Hour={true}
              onChange={onChange}
              maximumDate={new Date()}
            />
          )}
        </View>
        <View style={styles.row}>
          <ThemedText style={styles.label}>Role:</ThemedText>
          <ModalSelector
            data={[
              { key: 'admin', label: 'Admin' },
              { key: 'read', label: 'Read Only' },
              { key: 'readWrite', label: 'Read and Write' },
            ]}
            style={styles.selector}
            initValue={userData.role}
            onChange={(option) => updateUserData('role', option.key)}
          />
        </View>
        <View style={styles.rowImage}>
          <ThemedText style={styles.label}>Profile Picture:</ThemedText>
          <View>
            <Button title="Select Image" onPress={pickImage} />
            {image && <Image source={{ uri: image }} style={styles.image} />}
          </View>
        </View>
      </ThemedView>
      <View style={styles.row}>
        <Button
          title="Submit User"
          disabled={isSubmiting}
          onPress={submitHandler}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    marginTop: 40,
  },
  row: {
    margin: 10,
    height: 40,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  rowImage: {
    margin: 10,
    height: 120,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  gender: {
    margin: 10,
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    width: '60%',
  },
  label: {
    fontWeight: 'bold',
    fontSize: 20,
  },
  input: {
    marginHorizontal: 10,
    borderWidth: 1,
    width: 250,
    height: 36,
  },
  date: {
    backgroundColor: '#F2F2F2',
  },
  selector: {
    width: 200,
  },
  image: {
    width: 100,
    height: 100,
  },
});
