import { useState } from 'react';
import { FlatList, StyleSheet } from 'react-native';
import { useFocusEffect } from 'expo-router';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';

import { getDocs, collection } from 'firebase/firestore';
import { db } from '@/firebaseConfig';
import UserCard from '@/components/UserCard';
import { getLocales } from 'expo-localization';
import { I18n } from 'i18n-js';
import en from '@/assets/translations/en';
import hi from '@/assets/translations/hi';

const translations = {
  en,
  hi,
};

const i18n = new I18n(translations);

i18n.locale = getLocales()[0].languageCode ?? 'en';

i18n.enableFallback = true;

interface UserProps {
  id: string;
  firstName: string;
  lastName: string;
  gender: string;
  dob: string;
  role: string;
  profilePicturePath: string;
}

export default function HomeScreen() {
  const [userList, setUserList] = useState<UserProps[] | null>(null);
  useFocusEffect(() => {
    const fetchUsers = async () => {
      const userList: UserProps[] = [];
      const querySnapshot = await getDocs(collection(db, 'users'));
      querySnapshot.forEach((doc) => {
        userList.push({
          id: doc.id,
          firstName: doc.data().firstName,
          lastName: doc.data().lastName,
          gender: doc.data().gender,
          dob: doc.data().dob,
          role: doc.data().role,
          profilePicturePath: doc.data().profilePicturePath,
        });
      });
      setUserList(userList);
    };
    fetchUsers();
  });

  return (
    <ThemedView style={styles.container}>
      <ThemedText style={styles.header}>{i18n.t('userList')}</ThemedText>
      <FlatList
        data={userList}
        renderItem={({ item }) => <UserCard user={item} />}
      />
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    marginTop: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollView: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  header: {
    padding: 24,
    fontSize: 32,
    fontWeight: 'bold',
  },
});
