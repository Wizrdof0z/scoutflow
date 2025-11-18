import Tesseract from 'tesseract.js'

export interface ExtractedMetric {
  name: string
  value: number
}

/**
 * Extract metrics from an image using OCR
 * @param imageFile - The image file to process
 * @returns Array of extracted metrics with names and values
 */
export async function extractMetricsFromImage(
  imageFile: File
): Promise<ExtractedMetric[]> {
  try {
    // Convert file to base64 or blob URL for Tesseract
    const imageUrl = URL.createObjectURL(imageFile)
    
    // Run OCR on the image
    const result = await Tesseract.recognize(imageUrl, 'eng', {
      logger: (m) => {
        // Optional: log progress
        if (m.status === 'recognizing text') {
          console.log(`OCR Progress: ${Math.round(m.progress * 100)}%`)
        }
      }
    })
    
    // Clean up the blob URL
    URL.revokeObjectURL(imageUrl)
    
    // Extract text
    const text = result.data.text
    console.log('OCR Extracted Text:', text)
    
    // Parse the text to find metrics and their values
    const metrics = parseMetricsFromText(text)
    console.log('Parsed Metrics:', metrics)
    
    return metrics
  } catch (error) {
    console.error('Error extracting metrics from image:', error)
    throw new Error('Failed to extract metrics from image')
  }
}

/**
 * Parse OCR text to extract metric names and values
 * Improved to handle chart layouts and ignore axis labels
 */
function parseMetricsFromText(text: string): ExtractedMetric[] {
  const metrics: ExtractedMetric[] = []
  const lines = text.split('\n').filter(line => line.trim().length > 0)
  
  console.log('All OCR lines:', lines)
  console.log('Raw OCR text:', text)
  
  // Extract ALL numbers from the entire text with a very aggressive regex
  // This will catch numbers even when surrounded by special characters
  const allNumbersInText: number[] = []
  
  // Try multiple extraction strategies
  
  // Strategy 1: Standard number extraction
  const numberRegex = /\d+\.?\d*/g
  let numberMatches = text.match(numberRegex)
  
  if (numberMatches) {
    numberMatches.forEach(match => {
      const num = parseFloat(match)
      if (!isNaN(num) && num >= 1 && num <= 100) {
        allNumbersInText.push(num)
      }
    })
  }
  
  // Strategy 2: Look for common OCR misreads of numbers
  // Sometimes OCR reads numbers as similar-looking characters
  const ocrSubstitutions: Record<string, string> = {
    'O': '0', 'o': '0',
    'I': '1', 'l': '1', '|': '1',
    'Z': '2', 'z': '2',
    'B': '8', 'b': '8',
    'S': '5', 's': '5',
    '@': '8', // Common OCR mistake
    'g': '9',
  }
  
  // Try to find 2-digit patterns that might be numbers with OCR errors
  // Look for patterns like "i@" (18), "@i" (81), etc.
  const potentialNumberPattern = /[O0oIl|1Z2zB8b@S5s][\s\-_.]*[O0oIl|1Z2z3B8b@S5s4g9]|[4-9][O0oIl|1Z2z3B8b@S5s]|[1-9][0-9]/g
  const potentialMatches = text.match(potentialNumberPattern)
  
  if (potentialMatches) {
    potentialMatches.forEach(match => {
      // Clean up the match and try substitutions
      let cleaned = match.replace(/[\s\-_.]/g, '') // Remove separators
      
      // Try to convert OCR mistakes to numbers
      Object.entries(ocrSubstitutions).forEach(([wrong, correct]) => {
        cleaned = cleaned.replace(new RegExp(wrong, 'g'), correct)
      })
      
      const num = parseInt(cleaned)
      if (!isNaN(num) && num >= 1 && num <= 100 && !allNumbersInText.includes(num)) {
        console.log(`Found potential number: "${match}" -> ${num}`)
        allNumbersInText.push(num)
      }
    })
  }
  
  // Strategy 3: Look at each line for isolated 2-digit sequences
  lines.forEach((line, idx) => {
    // Look for any sequence of exactly 2 digits
    const twoDigitMatches = line.match(/\b\d{2}\b|\d{2}(?=\D|$)|(?<=\D)\d{2}/g)
    if (twoDigitMatches) {
      twoDigitMatches.forEach(match => {
        const num = parseInt(match)
        if (!isNaN(num) && num >= 1 && num <= 100 && !allNumbersInText.includes(num)) {
          console.log(`Found 2-digit number on line ${idx}: ${num} in "${line}"`)
          allNumbersInText.push(num)
        }
      })
    }
  })
  
  console.log(`Found ${allNumbersInText.length} total numbers:`, allNumbersInText)
  
  // Filter out obvious axis values (0, 25, 50, 75, 100) but keep everything else
  const axisValues = new Set([0, 25, 50, 75, 100])
  const validNumbers = allNumbersInText.filter(num => !axisValues.has(num))
  
  console.log(`After filtering axis values: ${validNumbers.length} numbers:`, validNumbers)
  
  // Common metric keywords to look for
  const metricKeywords = [
    'pass completion',
    'pass attempts',
    'ball retention',
    'dangerous pass',
    'difficult pass',
    'pressure',
    'under high',
    'under medium',
    'under low',
    'touches',
    'dribbles',
    'carries',
    'progressive',
    'defensive',
    'tackles',
    'interceptions',
    'blocks',
    'clearances',
    'aerial',
    'duels'
  ]
  
  // Find all metric names
  const metricLines: { index: number, text: string }[] = []
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]
    const lineLower = line.toLowerCase().trim()
    
    // Skip obvious axis labels
    if (lineLower === 'percentile rank' || lineLower.match(/^[0-9\s]+$/)) {
      continue
    }
    
    // Check if this line contains a metric keyword
    const hasMetricKeyword = metricKeywords.some(keyword => 
      lineLower.includes(keyword)
    )
    
    if (hasMetricKeyword) {
      metricLines.push({ index: i, text: line.trim() })
      console.log(`Metric found at line ${i}: "${line.trim()}"`)
    }
  }
  
  console.log(`Found ${metricLines.length} metrics`)
  
  // If we found NO numbers at all, the OCR might not be detecting them properly
  // Try to manually search for standalone 2-digit numbers
  if (validNumbers.length === 0) {
    console.log('No valid numbers found - trying alternative extraction...')
    // Look for patterns like "...73" or "...68" at the end of lines
    lines.forEach((line, idx) => {
      const endNumbers = line.match(/\d{2,3}$/);
      if (endNumbers) {
        const num = parseInt(endNumbers[0])
        if (num >= 1 && num <= 100 && !axisValues.has(num)) {
          validNumbers.push(num)
          console.log(`Found number ${num} at end of line ${idx}: "${line}"`)
        }
      }
    })
  }
  
  // Match metrics with numbers sequentially
  // Assume each metric corresponds to one number in order
  for (let i = 0; i < metricLines.length && i < validNumbers.length; i++) {
    metrics.push({
      name: metricLines[i].text,
      value: validNumbers[i]
    })
    console.log(`Matched "${metricLines[i].text}" with value ${validNumbers[i]}`)
  }
  
  console.log(`Returning ${metrics.length} matched metrics`)
  return metrics
}

/**
 * Extract all numbers from a text line
 * Returns numbers that could be valid percentile values (1-99, excluding common axis values)
 */
function extractNumbersFromLine(line: string): number[] {
  // Match numbers (including decimals)
  const numberRegex = /\b\d+\.?\d*\b/g
  const matches = line.match(numberRegex)
  
  if (!matches) return []
  
  // Common axis values to exclude
  const axisValues = new Set([0, 25, 50, 75, 100])
  
  return matches
    .map(match => parseFloat(match))
    .filter(num => {
      // Must be a valid number
      if (isNaN(num)) return false
      
      // Must be within percentile range
      if (num < 0 || num > 100) return false
      
      // Exclude common axis values
      if (axisValues.has(num)) return false
      
      return true
    })
}

/**
 * Match extracted metrics to the metrics defined in metrics-config.ts
 * Uses fuzzy matching to handle OCR errors and variations in naming
 */
export function matchExtractedMetrics(
  extractedMetrics: ExtractedMetric[],
  expectedMetricNames: string[]
): Record<string, number> {
  const matched: Record<string, number> = {}
  
  for (const expectedMetric of expectedMetricNames) {
    // Try to find a matching extracted metric
    const match = extractedMetrics.find(extracted => 
      fuzzyMatch(extracted.name, expectedMetric)
    )
    
    if (match) {
      matched[expectedMetric] = match.value
    }
  }
  
  return matched
}

/**
 * Fuzzy matching for metric names to handle OCR errors
 */
function fuzzyMatch(text1: string, text2: string): boolean {
  const normalized1 = text1.toLowerCase().replace(/[^a-z0-9]/g, '')
  const normalized2 = text2.toLowerCase().replace(/[^a-z0-9]/g, '')
  
  // Check if one contains the other
  if (normalized1.includes(normalized2) || normalized2.includes(normalized1)) {
    return true
  }
  
  // Calculate similarity (simple approach)
  const similarity = calculateSimilarity(normalized1, normalized2)
  return similarity > 0.7 // 70% similarity threshold
}

/**
 * Calculate similarity between two strings (0-1 scale)
 */
function calculateSimilarity(str1: string, str2: string): number {
  const longer = str1.length > str2.length ? str1 : str2
  const shorter = str1.length > str2.length ? str2 : str1
  
  if (longer.length === 0) return 1.0
  
  const editDistance = getEditDistance(longer, shorter)
  return (longer.length - editDistance) / longer.length
}

/**
 * Calculate Levenshtein distance between two strings
 */
function getEditDistance(str1: string, str2: string): number {
  const matrix: number[][] = []
  
  for (let i = 0; i <= str2.length; i++) {
    matrix[i] = [i]
  }
  
  for (let j = 0; j <= str1.length; j++) {
    matrix[0][j] = j
  }
  
  for (let i = 1; i <= str2.length; i++) {
    for (let j = 1; j <= str1.length; j++) {
      if (str2.charAt(i - 1) === str1.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1]
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1,
          matrix[i][j - 1] + 1,
          matrix[i - 1][j] + 1
        )
      }
    }
  }
  
  return matrix[str2.length][str1.length]
}
