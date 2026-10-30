# AYDO Android APK (Trusted Web Activity)

This folder is the workspace for the Android Trusted Web Activity generated with Bubblewrap.

## App identity

- App name: AYDO – Kalkulator Merchant
- Android launcher name: AYDO
- Android package ID: `com.xkalkultor.app`
- Production origin: `https://ex-kalkulator.vercel.app`
- Web manifest: `https://ex-kalkulator.vercel.app/manifest.webmanifest`

The Android app loads the existing production website. Authentication, API routes, and user data continue to use the existing Next.js + Neon backend. An internet connection is required.

## Prerequisites

- Node.js 20 LTS or newer
- Java JDK 17
- Android SDK / Android build tools
- A public HTTPS production deployment where the web manifest and all listed icons return HTTP 200

## Generate the Android project

Run these commands from the repository root:

```bash
mkdir -p android
cd android
npx @bubblewrap/cli@latest init --manifest=https://ex-kalkulator.vercel.app/manifest.webmanifest
```

During the interactive setup, confirm these values:

- Package ID: `com.xkalkultor.app`
- App name: `AYDO – Kalkulator Merchant`
- Launcher name: `AYDO`
- Host: `ex-kalkulator.vercel.app`
- Start URL: `/`
- Display: `standalone`
- Orientation: `portrait`
- Theme color: `#e37151`
- Background color: `#ffffff`

Bubblewrap will generate the Android project and ask to create or configure a signing key. Keep the generated keystore and its passwords in a secure backup. The keystore is required for every future update of this APK. Never commit the keystore or passwords to Git.

## Build a signed APK

After the project has been generated and the JDK / Android SDK are configured:

```bash
npx @bubblewrap/cli@latest doctor
npx @bubblewrap/cli@latest build
```

Bubblewrap produces `app-release-signed.apk` for direct Android distribution and an App Bundle for Google Play. The APK can be installed for testing before domain verification, but it will show browser UI until Digital Asset Links is configured.

## Configure Digital Asset Links (required for full-screen trusted mode)

1. Obtain the SHA-256 certificate fingerprint for the exact signing key used for the release APK.
2. Generate the Digital Asset Links JSON with Bubblewrap, or create the file using the fingerprint and package ID below.
3. Publish the file at:

   `https://ex-kalkulator.vercel.app/.well-known/assetlinks.json`

Expected JSON shape (replace the fingerprint placeholder with the real colon-separated SHA-256 fingerprint; do not publish the placeholder):

```json
[
  {
    "relation": ["delegate_permission/common.handle_all_urls"],
    "target": {
      "namespace": "android_app",
      "package_name": "com.xkalkultor.app",
      "sha256_cert_fingerprints": [
        "REPLACE_WITH_REAL_RELEASE_CERTIFICATE_SHA256"
      ]
    }
  }
]
```

The file must be publicly accessible over HTTPS and return JSON, without login or redirects to a protected deployment. If the APK is signed with a different key later, update this file with that certificate fingerprint.

## Release checklist

- [ ] Production site is public and uses HTTPS.
- [ ] `/manifest.webmanifest` returns HTTP 200 and valid JSON.
- [ ] The 192px, 512px, and maskable icons return HTTP 200.
- [ ] Bubblewrap project uses package ID `com.xkalkultor.app`.
- [ ] Release keystore is backed up securely and excluded from Git.
- [ ] `/.well-known/assetlinks.json` contains the real release certificate fingerprint.
- [ ] Install the signed APK on a physical Android device and test login, logout, navigation, and data sync.

## Important

- Do not change `com.xkalkultor.app` after publishing the app.
- Do not lose the release keystore. A different signing key cannot update existing installations as the same app.
- The app is online-first. The website, authentication APIs, and Neon database remain hosted as they are today.
- Rebuild and sign each Android release with the same keystore. Updating the website alone updates the content loaded by installed TWA clients.
