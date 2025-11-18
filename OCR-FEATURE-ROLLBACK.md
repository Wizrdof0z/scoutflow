# OCR Image Upload Feature - Rollback Instructions

## What was added:
1. **New dependency**: `tesseract.js` for OCR functionality
2. **New file**: `src/utils/ocr-extractor.ts` - OCR utility functions
3. **Updated file**: `src/components/MetricsCalculator.tsx` - Added image upload UI

## How to completely remove this feature:

### Option 1: Quick Disable (Recommended for testing)
In `src/components/MetricsCalculator.tsx`, find this line:
```tsx
const [showImageUpload, setShowImageUpload] = useState(false);
```
Keep it as `false` and comment out or remove the "Upload Images for Auto-Fill" toggle button.
The feature will be hidden but code remains intact.

### Option 2: Complete Removal

1. **Remove the dependency:**
   ```bash
   npm uninstall tesseract.js
   ```

2. **Delete the OCR utility file:**
   Delete `src/utils/ocr-extractor.ts`

3. **Revert MetricsCalculator.tsx:**
   - Remove this import:
     ```tsx
     import { extractMetricsFromImage, matchExtractedMetrics } from '../utils/ocr-extractor';
     ```
   - Remove these state variables:
     ```tsx
     const [isProcessingImage, setIsProcessingImage] = useState(false);
     const [uploadError, setUploadError] = useState<string | null>(null);
     const [showImageUpload, setShowImageUpload] = useState(false);
     ```
   - Remove the `handleImageUpload` function
   - Remove the "Upload Images for Auto-Fill" toggle section
   - Remove the image upload buttons from each section

4. **Git revert (if using version control):**
   ```bash
   git log --oneline  # Find the commit before OCR feature
   git revert <commit-hash>
   ```

## Feature is safe because:
- ✅ It's opt-in (hidden by default with toggle button)
- ✅ Manual input still works exactly as before
- ✅ No database changes
- ✅ No changes to existing calculation logic
- ✅ Isolated in separate files
- ✅ Can be disabled with a single boolean flag

## Testing the feature:
1. Open the Metrics Calculator
2. Click "Show Upload" button
3. Click "Upload Image" for any section (e.g., Pressure)
4. Select a chart image
5. Wait for OCR processing
6. Check if metrics are auto-filled

## Known limitations:
- OCR accuracy depends on image quality
- Works best with clear, high-contrast images
- May require some manual corrections
- Processing takes 2-5 seconds per image
