"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ImgStack = void 0;
const react_1 = __importDefault(require("react"));
const inject_styles_js_1 = require("./inject-styles.js");
const ASPECT_RATIOS = {
    square: { width: 1, height: 1 },
    landscape: { width: 4, height: 3 },
    wide: { width: 16, height: 9 },
    ultrawide: { width: 21, height: 9 },
    portrait: { width: 3, height: 4 },
    tall: { width: 9, height: 16 },
};
function calculateDimensions(size) {
    if (!size) {
        return {
            width: "100%",
            height: "180px",
        };
    }
    if (size.type === "fixed") {
        return {
            width: `${size.width}px`,
            maxWidth: "100vw",
            height: `${size.height}px`,
        };
    }
    if (typeof size.ratio === "number") {
        return {
            width: `${size.width}px`,
            maxWidth: "100vw",
            height: "auto",
            aspectRatio: `${size.ratio}/1`,
        };
    }
    const { width, height } = ASPECT_RATIOS[size.ratio];
    return {
        width: `${size.width}px`,
        maxWidth: "100vw",
        height: "auto",
        aspectRatio: `${width}/${height}`,
    };
}
function getAspectRatio(size) {
    if (!size)
        return undefined;
    if (size.type === "fixed") {
        return `${size.width}/${size.height}`;
    }
    if (typeof size.ratio === "number") {
        return `${size.ratio}/1`;
    }
    const { width, height } = ASPECT_RATIOS[size.ratio];
    return `${width}/${height}`;
}
function ImgStack({ images, subject = "Project", className = "", size }) {
    const [dialogOpen, setDialogOpen] = react_1.default.useState(false);
    const [animatedStacks, setAnimatedStacks] = react_1.default.useState([]);
    const [isHovered, setIsHovered] = react_1.default.useState(false);
    const [currentIndex, setCurrentIndex] = react_1.default.useState(0);
    const stackRef = react_1.default.useRef(null);
    const dialogRefs = react_1.default.useRef([]);
    const buttonRefs = react_1.default.useRef([]);
    const touchStartX = react_1.default.useRef(null);
    const touchMoveX = react_1.default.useRef(null);
    const dimensions = react_1.default.useMemo(() => calculateDimensions(size), [size]);
    const aspectRatio = react_1.default.useMemo(() => getAspectRatio(size), [size]);
    const handleTouchStart = (e) => {
        touchStartX.current = e.touches[0].clientX;
    };
    const handleTouchMove = (e) => {
        if (touchStartX.current === null)
            return;
        touchMoveX.current = e.touches[0].clientX;
    };
    const handleTouchEnd = () => {
        if (touchStartX.current === null || touchMoveX.current === null)
            return;
        const deltaX = touchMoveX.current - touchStartX.current;
        const minSwipeDistance = 50;
        if (Math.abs(deltaX) > minSwipeDistance) {
            if (deltaX < 0 && currentIndex < images.length - 1) {
                // Swipe left - next image
                setCurrentIndex((prev) => prev + 1);
            }
            else if (deltaX > 0 && currentIndex > 0) {
                // Swipe right - previous image
                setCurrentIndex((prev) => prev - 1);
            }
        }
        touchStartX.current = null;
        touchMoveX.current = null;
    };
    // Separate effect for styles and rotation setup
    react_1.default.useEffect(() => {
        (0, inject_styles_js_1.injectStyles)();
        const root = document.documentElement;
        for (let i = 1; i <= 5; i++) {
            const isNegative = i % 2 === 1;
            const randomAngle = (Math.random() * 6 + 2) * (isNegative ? -1 : 1);
            root.style.setProperty(`--stack-rotation-${i}`, `${randomAngle}deg`);
        }
    }, []);
    // Separate effect for intersection observer
    react_1.default.useEffect(() => {
        // Wait for next frame to ensure layout is complete
        const timeoutId = setTimeout(() => {
            const observer = new IntersectionObserver((entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        // Animate stacks one by one with delays
                        images.forEach((_, index) => {
                            setTimeout(() => {
                                setAnimatedStacks((prev) => [...prev, index]);
                            }, index * 100);
                        });
                        observer.unobserve(entry.target);
                    }
                });
            }, {
                root: null,
                threshold: 0,
                rootMargin: "50px",
            });
            if (stackRef.current) {
                observer.observe(stackRef.current);
            }
            return () => observer.disconnect();
        }, 100); // Small delay to ensure layout is complete
        return () => clearTimeout(timeoutId);
    }, [images.length]);
    // Dialog effect
    react_1.default.useEffect(() => {
        const dialog = dialogRefs.current[0];
        if (!dialog)
            return;
        const handleTransitionEnd = (e) => {
            if (e.propertyName === "opacity" && !dialogOpen) {
                dialog.close();
            }
        };
        dialog.addEventListener("transitionend", handleTransitionEnd);
        if (dialogOpen) {
            dialog.showModal();
            // Force a reflow before adding the open class
            void dialog.offsetWidth;
            dialog.classList.add("dialog-open");
        }
        else {
            dialog.classList.remove("dialog-open");
        }
        return () => {
            dialog.removeEventListener("transitionend", handleTransitionEnd);
        };
    }, [dialogOpen]);
    const imagesLength = images.length;
    const btnLabel = imagesLength === 1
        ? `View 1 ${subject} image`
        : `View ${imagesLength} ${subject} images`;
    return (react_1.default.createElement("div", { className: "img-stack-root", style: { ...dimensions, position: "relative" } },
        react_1.default.createElement("button", { ref: (el) => {
                stackRef.current = el;
                buttonRefs.current[0] = el;
            }, className: `project-images-stack ${className}`, "data-in-view": animatedStacks.length > 0 ? "true" : "false", onClick: () => setDialogOpen(true), onMouseEnter: () => setIsHovered(true), onMouseLeave: () => setIsHovered(false), onTouchStart: handleTouchStart, onTouchMove: handleTouchMove, onTouchEnd: handleTouchEnd, "aria-label": btnLabel, style: { position: "absolute", inset: 0 } }, images.map((image, i) => (react_1.default.createElement("div", { key: i, className: "project-image-wrapper", "data-visible": i >= currentIndex && i <= currentIndex + 2, style: {
                top: `${i * 4}px`,
                "--stack-rotation": `var(--stack-rotation-${i + 1}, ${i % 2 ? 4 : -4}deg)`,
                "--stack-translate-x": `${i % 2 ? 8 : -8}px`,
                zIndex: images.length - i,
                overflow: "hidden",
                visibility: i >= currentIndex && i <= currentIndex + 2
                    ? "visible"
                    : "hidden",
            } },
            react_1.default.createElement("img", { className: "project-image", src: image.src, alt: image.alt }),
            i === currentIndex && (react_1.default.createElement("div", { className: "project-image-caption" }, btnLabel)))))),
        react_1.default.createElement("dialog", { ref: (el) => {
                dialogRefs.current[0] = el;
            }, className: "project-dialog", onCancel: (e) => {
                e.preventDefault();
                setDialogOpen(false);
            }, onClick: (e) => {
                if (e.target === e.currentTarget) {
                    setDialogOpen(false);
                }
            } },
            react_1.default.createElement("div", { className: "dialog-content" },
                react_1.default.createElement("header", { className: "dialog-header" },
                    react_1.default.createElement("h2", { className: "dialog-title" },
                        subject,
                        " Images"),
                    react_1.default.createElement("button", { className: "dialog-close", onClick: () => setDialogOpen(false), "aria-label": "Close dialog" }, "\u00D7")),
                react_1.default.createElement("div", { className: "dialog-body" }, images.map((image, i) => (react_1.default.createElement("figure", { key: i },
                    react_1.default.createElement("img", { src: image.src, alt: image.alt, style: aspectRatio ? { aspectRatio } : undefined }),
                    react_1.default.createElement("figcaption", null, image.caption)))))))));
}
exports.ImgStack = ImgStack;
