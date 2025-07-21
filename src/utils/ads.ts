import { AdMobInterstitial, setTestDeviceIDAsync } from 'expo-ads-admob';

const adUnitID = 'ca-app-pub-6774635260442653/6685225596'; // PRODUCCIÓN

export const showInterstitialAd = async () => {
  await setTestDeviceIDAsync('EMULATOR'); // puedes poner tu ID real si lo sabes

  await AdMobInterstitial.setAdUnitID(adUnitID);
  await AdMobInterstitial.requestAdAsync({ servePersonalizedAds: true });

  await AdMobInterstitial.showAdAsync();
};
