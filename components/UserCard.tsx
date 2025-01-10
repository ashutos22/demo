import { StyleSheet, View, Image } from 'react-native';
import Card from './ui/Card';
import { ThemedText } from './ThemedText';

interface UserProps {
  id: string;
  firstName: string;
  lastName: string;
  gender: string;
  dob: string;
  role: string;
  profilePicturePath: string;
}

interface UserCardProps {
  user: UserProps;
}

export default function UserCard({ user }: UserCardProps) {
  return (
    <Card>
      <View style={styles.container}>
        <Image style={styles.image} source={{ uri: user.profilePicturePath }} />
        <View style={styles.info}>
          <View style={styles.data}>
            <ThemedText style={styles.label}>Name:</ThemedText>
            <ThemedText style={styles.text}>
              {user.firstName} {user.lastName}
            </ThemedText>
          </View>
          <View style={styles.data}>
            <ThemedText style={styles.label}>Gender:</ThemedText>
            <ThemedText style={styles.text}>{user.gender}</ThemedText>
          </View>
          <View style={styles.data}>
            <ThemedText style={styles.label}>Date of birth:</ThemedText>
            <ThemedText style={styles.text}>{user.dob}</ThemedText>
          </View>
          <View style={styles.data}>
            <ThemedText style={styles.label}>Role:</ThemedText>
            <ThemedText style={styles.text}>{user.role}</ThemedText>
          </View>
        </View>
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  info: {
    flexDirection: 'column',
    marginLeft: 20,
  },
  data: {
    flexDirection: 'row',
  },
  image: {
    height: 100,
    width: 100,
  },
  label: {
    fontWeight: 'bold',
  },
  text: {
    marginLeft: 5,
  },
});
