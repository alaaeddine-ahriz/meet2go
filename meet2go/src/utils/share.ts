import { useRouter } from 'expo-router';
import { Share } from 'react-native';

export function getShareHandler(): any  {
  const router = useRouter();

  const handleShare = async (name: string, inviteCode: string) => {
    try {
      await Share.share({
        message: `Join my quest "${name}" on Meet2Go!\nLink: meet2go://quest/${inviteCode}`,
      });
      router.back();
    } catch (error) {
      console.error('Error sharing:', error);
      router.back();
    }
  };

  return handleShare;
};

// export const shareBtnStyle = {
//     marginTop: spacing.sm,
//     width: '100%',
//   };