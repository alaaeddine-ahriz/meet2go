import { useRouter } from 'expo-router';
import { useCallback } from 'react';
import { Share } from 'react-native';

/**
 * Hook that returns a share handler bound to the current router instance.
 * This keeps the router context read during render instead of during an event.
 */
export function useShareHandler() {
  const router = useRouter();

  return useCallback(
    async (name: string, inviteCode: string) => {
      try {
        await Share.share({
          message: `Join my quest "${name}" on Meet2Go!\nLink: meet2go://quest/${inviteCode}`,
        });
      } catch (error) {
        console.error('Error sharing:', error);
      } finally {
        router.back();
      }
    },
    [router]
  );
}
