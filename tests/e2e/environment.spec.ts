import { expect, test } from '@playwright/test';

test('reports browser WebGL capability', async ({ page }, testInfo) => {
  await page.goto('/work');
  const capability = await page.evaluate(() => {
    const canvas = document.createElement('canvas');
    const messages: string[] = [];
    canvas.addEventListener('webglcontextcreationerror', (event) =>
      messages.push((event as WebGLContextEvent).statusMessage),
    );
    const gl = canvas.getContext('webgl2');
    const debug = gl?.getExtension('WEBGL_debug_renderer_info');
    return {
      available: Boolean(gl),
      renderer:
        gl && debug
          ? String(gl.getParameter(debug.UNMASKED_RENDERER_WEBGL))
          : null,
      messages,
      userAgent: navigator.userAgent,
    };
  });
  await testInfo.attach('webgl-capability', {
    body: JSON.stringify(capability, null, 2),
    contentType: 'application/json',
  });
  console.log(JSON.stringify(capability));
  expect(capability.available).toBe(true);
});
