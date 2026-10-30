# AYDO Android APK Distribution

AYDO is distributed as an Android Trusted Web Activity (TWA) that loads the production Next.js application.

## App identity

- App name: AYDO – Kalkulator Merchant
- Android package ID: `com.xkalkultor.app`
- Production origin: `https://ex-kalkulator.vercel.app`
- Web manifest: `https://ex-kalkulator.vercel.app/manifest.webmanifest`
- Public APK: `https://github.com/YosmerryGod/Xkalkultor/releases/latest/download/AYDO.apk`

The Android package ID is a permanent app identity. Do not change it after publishing.

## One-time GitHub Actions setup

Create these repository Actions secrets in **Settings → Secrets and variables → Actions**:

| Secret | Value |
| --- | --- |
| `ANDROID_KEYSTORE_BASE64` | Base64-encoded permanent release keystore |
| `ANDROID_KEYSTORE_PASSWORD` | Keystore password |
| `ANDROID_KEY_ALIAS` | Signing key alias (currently `aydo`) |
| `ANDROID_KEY_PASSWORD` | Private key password |

Generate the Base64 value locally without committing the keystore:

```bash
base64 -w 0 android.keystore
```

On macOS, use `base64 < android.keystore | tr -d '\\n'`. Store the resulting value only in the GitHub secret. Never commit the keystore, passwords, or Base64 contents.

The keystore must be the same permanent key used for every update. Losing it or signing a later APK with another key prevents Android from installing that APK as an update to existing installations.

## Digital Asset Links

The verified signing certificate fingerprint is configured in:

`public/.well-known/assetlinks.json`

It is served at:

`https://ex-kalkulator.vercel.app/.well-known/assetlinks.json`

Keep the package ID and fingerprint in sync with the permanent release keystore. If the signing key changes, existing installations cannot be updated with the replacement key.

## Release a new APK

1. Make and deploy the web app changes as usual.
2. Update the version name and version code in `android/twa-manifest.json` for the next release. The version code must be a positive integer greater than the code used by the previous APK.
3. Commit the version metadata update to `main`.
4. Create and push a version tag from the intended release commit:

   ```bash
   git checkout main
   git pull origin main
   git tag v1.0.1
   git push origin v1.0.1
   ```

   Replace `1.0.1` with the release version. A tag push starts the Android workflow automatically. The workflow derives the version name from the tag and assigns the GitHub Actions run number as the Android version code.
5. Alternatively, open **Actions → Build and Release AYDO Android APK → Run workflow**. Enter the version name and a version code greater than the previous release.
6. Wait for the workflow to build, align, sign, and verify the APK. The workflow publishes `AYDO.apk` to a GitHub Release and also stores a 30-day artifact backup.

## Download URL

The website download card points to this stable URL:

`https://github.com/YosmerryGod/Xkalkultor/releases/latest/download/AYDO.apk`

Each successful release uploads the same asset name, `AYDO.apk`, to the latest GitHub Release. Users do not need a new download URL for future versions.

## Local Android project commands

Requirements: Node.js 20+, Java 17, Android SDK, and Bubblewrap CLI 1.27.0.

```bash
npm install --global @bubblewrap/cli@1.27.0
cd android
bubblewrap doctor
bubblewrap update --skipVersionUpgrade
bubblewrap build --skipSigning --skipPwaValidation
```

The release workflow performs signing with the configured GitHub secrets. Do not use a temporary or debug key for production releases.

## Release verification checklist

- [ ] GitHub Actions secrets are configured and refer to the permanent signing key.
- [ ] `android/twa-manifest.json` has the intended app version name and increasing version code.
- [ ] `https://ex-kalkulator.vercel.app/.well-known/assetlinks.json` returns HTTP 200, JSON, and no redirect.
- [ ] The asset links package ID is `com.xkalkultor.app`.
- [ ] The APK signature certificate matches the fingerprint in asset links.
- [ ] Install the APK on a physical Android device and test login, navigation, and data sync.
- [ ] Confirm the latest GitHub Release contains `AYDO.apk`.

The app is online-first. Website content, authentication, API routes, and Neon PostgreSQL data remain hosted by the existing Next.js deployment.
