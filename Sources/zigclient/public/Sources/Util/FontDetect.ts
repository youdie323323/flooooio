export default class FontDetect {
    private static wasInitialized: boolean = false;
    private static span: HTMLSpanElement | null = null;
    private static readonly fallbackFonts: string[] = ["serif", "sans-serif", "monospace", "cursive", "fantasy"];

    private constructor() {
    }

    public static init(): void {
        if (FontDetect.wasInitialized === true) {
            return;
        }

        FontDetect.wasInitialized = true;

        const body = document.body;
        const firstChild = document.body.firstChild;

        const div = document.createElement("div");
        div.id = "fontdetectHelper";
        FontDetect.span = document.createElement("span");
        FontDetect.span.innerText = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";
        div.appendChild(FontDetect.span);

        body.insertBefore(div, firstChild);

        div.style.position = "fixed";
        div.style.visibility = "hidden";
        div.style.top = "-200px";
        div.style.left = "-100000px";
        div.style.width = "100000px";
        div.style.height = "200px";
        div.style.fontSize = "100px";
    }

    public static onFontLoaded(
        cssFontName: string,
        onLoad: (fontName: string) => void,
        onFail?: (fontName: string) => void,
        options?: { msInterval?: number; msTimeout?: number },
    ): void {
        if (!cssFontName) {
            return;
        }

        const msInterval = options?.msInterval ?? 10;
        const msTimeout = options?.msTimeout ?? 2000;

        if (!onLoad && !onFail) {
            return;
        }

        if (FontDetect.wasInitialized === false) {
            FontDetect.init();
        }

        if (FontDetect.isFontLoaded(cssFontName)) {
            if (onLoad) {
                onLoad(cssFontName);
            }

            return;
        }

        const utStart = Date.now();
        const idInterval = window.setInterval(() => {
            if (FontDetect.isFontLoaded(cssFontName)) {
                window.clearInterval(idInterval);

                if (onLoad) {
                    onLoad(cssFontName);
                }

                return;
            } else {
                const utNow = Date.now();
                if ((utNow - utStart) > msTimeout) {
                    window.clearInterval(idInterval);
                    if (onFail) {
                        onFail(cssFontName);
                    }
                }
            }
        }, msInterval);
    }

    public static isFontLoaded(cssFontName: string, innerText: string = null): boolean {
        let wThisFont = 0;
        let wPrevFont = 0;

        if (FontDetect.wasInitialized === false) {
            FontDetect.init();
        }

        if (!FontDetect.span) {
            return false;
        }

        FontDetect.span.innerText = innerText || "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";

        for (let ix = 0; ix < FontDetect.fallbackFonts.length; ix++) {
            FontDetect.span.style.fontFamily = `${cssFontName},${FontDetect.fallbackFonts[ix]}`;
            wThisFont = FontDetect.span.offsetWidth;
            if (ix > 0 && wThisFont !== wPrevFont) {
                return false;
            }

            wPrevFont = wThisFont;
        }

        return true;
    }
}
