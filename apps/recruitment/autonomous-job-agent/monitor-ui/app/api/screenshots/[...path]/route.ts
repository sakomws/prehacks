import { NextRequest, NextResponse } from 'next/server';
import { readFile } from 'fs/promises';
import { join } from 'path';

export async function GET(
  request: NextRequest,
  { params }: { params: { path: string[] } }
) {
  try {
    const filename = params.path.join('/');
    
    // Try multiple possible screenshot locations
    const possiblePaths = [
      join(process.cwd(), '..', 'artifacts', 'screenshots', filename), // jhv5 screenshots
      join(process.cwd(), '..', '..', '..', 'recruitment', 'jobhax', 'screenshots', filename), // jobhax screenshots
      join(process.cwd(), '..', '..', '..', 'recruitment', 'browser_automation', filename), // browser automation screenshots
    ];
    
    let fileBuffer;
    let foundPath = '';
    
    for (const filePath of possiblePaths) {
      try {
        fileBuffer = await readFile(filePath);
        foundPath = filePath;
        break;
      } catch (err) {
        // Continue to next path
        continue;
      }
    }
    
    if (!fileBuffer) {
      console.error(`Screenshot not found: ${filename}`);
      return new NextResponse('Screenshot not found', { status: 404 });
    }
    
    console.log(`Serving screenshot: ${filename} from ${foundPath}`);
    
    return new NextResponse(fileBuffer, {
      headers: {
        'Content-Type': 'image/png',
        'Cache-Control': 'public, max-age=3600',
      },
    });
  } catch (error) {
    console.error('Error serving screenshot:', error);
    return new NextResponse('Screenshot not found', { status: 404 });
  }
}
