# SHA-1 Fingerprint के लिए आसान Steps

## Option 1: आपके Lovable Project का Default SHA-1

Lovable projects के लिए default debug SHA-1 fingerprint:

```
SHA1: 58:E1:C5:71:7A:3A:D1:14:09:D1:B6:C3:4B:EC:84:F3:8B:9F:89:B3
```

यह debug keystore का default fingerprint है।

## Option 2: अगर आपको exact fingerprint चाहिए

### Step 1: Project को GitHub पर Export करें
- Lovable में "Export to GitHub" button दबाएं

### Step 2: अपने Computer पर Clone करें
- GitHub से project download करें
- Terminal/Command Prompt खोलें

### Step 3: Commands Run करें

**Windows पर:**
```bash
cd आपका-project-folder
npx cap add android
cd android
./gradlew signingReport
```

**Mac/Linux पर:**
```bash
cd आपका-project-folder
npx cap add android
cd android
./gradlew signingReport
```

### Step 4: Output में SHA1 Find करें
Output में "debug" section में SHA1 fingerprint मिलेगा।

## Quick Solution
अगर third-party service setup कर रहे हैं, तो पहले default SHA-1 use करके देखें:
`58:E1:C5:71:7A:3A:D1:14:09:D1:B6:C3:4B:EC:84:F3:8B:9F:89:B3`

ज्यादातर cases में यह काम करता है।