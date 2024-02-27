import * as THREE from "three";
import { AsciiEffect } from "three/addons/effects/AsciiEffect.js";
import Stats from "three/addons/libs/stats.module.js";
import { DRACOLoader } from "three/addons/loaders/DRACOLoader.js";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
import {
  CSS3DRenderer,
  CSS3DObject,
} from "three/addons/renderers/CSS3DRenderer.js";

// ------------------------------------
// ------------- elements -------------
// ------------------------------------

const JUMBOTRON_DESCRIPTION_LINK_SELECTOR = "#jumbotron .description a";
const SCROLL_DOWN_INDICATOR_SELECTOR = "#jumbotron .scroll-down";
const SELECTED_WORK_BUTTONS_SELECTOR = "#selected-work .slide .button";
const FOOTER_LOGO_SELECTOR = "#footer .footer-logo";
const FOOTER_EMAIL_LINKS_SELECTOR = "#footer .email";
const FOOTER_SOCIAL_LINKS_SELECTOR = "#footer .social-media";

const html = document.documentElement;
const cursor = document.getElementById("cursor");
const cursorAction = document.getElementById("cursor-action");
const loadingScreen = document.getElementById("loading-screen");
const loadingScreenPercentageValue = loadingScreen.querySelector(".value");
const loadingScreenMobileStartButton = loadingScreen.querySelector(
  ".mobile-start-button"
);
const jumbotron = document.getElementById("jumbotron");
const jumbotronDescriptionLink = document.querySelector(
  JUMBOTRON_DESCRIPTION_LINK_SELECTOR
);
const asciiLogoContainer = document.getElementById("ascii-logo");
const asciiLogoMobileOverlay =
  asciiLogoContainer.querySelector(".mobile-overlay");
const scrollDownIndicator = document.querySelector(
  SCROLL_DOWN_INDICATOR_SELECTOR
);
const selectedWork = document.getElementById("selected-work");
const selectedWorkSlides = selectedWork.querySelectorAll(".slide");
const laptopContainer = document.getElementById("laptop");
const laptopScreen = document.getElementById("laptop-screen");
const laptopScreenContainer = document.getElementById("screen-content");
let updatedScreenContent;
let infoPopup;
let infoPopupText;
const footer = document.getElementById("footer");
const footerBackground = footer.querySelector(".background");
const footerCarouselTrack = footer.querySelector(".carousel-track");
const footerLogo = document.querySelector(FOOTER_LOGO_SELECTOR);
const footerEmailLinks = document.querySelectorAll(FOOTER_EMAIL_LINKS_SELECTOR);
const footerSocialLinks = document.querySelectorAll(
  FOOTER_SOCIAL_LINKS_SELECTOR
);
const placeholders = {
  jumbotron: document.querySelector("#placeholders .jumbotron"),
  selectedWork: document.querySelector("#placeholders .selected-work"),
  footer: document.querySelector("#placeholders .footer"),
};

// ------------------------------------
// ----------- global vars ------------
// ------------------------------------

const asciiLogoScene = {
  // geometryFile
  // container
  // mesh
  // scene
  // renderer (with effect)
  // camera
  // controls
};
const laptopScene = {
  // geometryFile
  // container
  // mesh
  // -- base
  // -- lid
  // -- screen
  // scene
  // renderer
  // camera
  // raycaster
  // controls
};
const laptopScreenScene = {
  // container
  // mesh
  // scene
  // renderer
};
let statsScene;
const currentLoadingPercentages = {
  ascii: 0,
  laptop: 0,
  fonts: 0,
  images: 0,
};
let displayedTotalLoadingPercentage = 0;
const mousePosition = {
  x: 0,
  y: 0,
  action: null,
  clicked: false,
  hoveredProject: undefined,
};
let hasScrolledPastJumbotronThreshold = false;
let infoPopupWaitStatus;
let infoPopupHiddenAfterStarted = false;
let laptopMeshHoverCount = 0;
let laptopMeshHovering = false;
let scrollPosition = 0;

// ------------------------------------
// ------------ constants -------------
// ------------------------------------

const IS_CHROME = navigator.userAgent.toLowerCase().includes("chrome");
const IS_FIREFOX = navigator.userAgent.toLowerCase().includes("firefox");
const IS_TOUCH_DEVICE = navigator.maxTouchPoints > 0;

const ASCII_LOGO_FILE = "./models/logo.glb";
const LAPTOP_FILE = "./models/laptop.glb";
const DRACO_DECODER_URL =
  "https://www.gstatic.com/draco/versioned/decoders/1.5.6/";
const ASCII_LOGO_FILE_SIZE_BYTES = 49464;
const LAPTOP_FILE_SIZE_BYTES = 70344;

const LOADING_WEIGHTS = {
  // need to add up to 1
  ascii: 0.25,
  laptop: 0.25,
  fonts: 0.25,
  images: 0.25,
};
const START_TIME = Date.now();
const ASCII_LOGO_ROTATION_SCALAR = 0.2;
const ASCII_AUTO_ROTATION_SPEED = 0.0005;
const ASCII_AUTO_ROTATION_MAX_DIST = 0.4;
const ASCII_LOGO_INIT = {
  rotation: { x: Math.PI / 2, y: 0, z: 0 },
};
const ASCII_LOGO_SCENE_CAMERA_Z_POS = 10;
const LAPTOP_INIT = {
  position: { x: 0, y: -100, z: 0 },
  rotation: { x: Math.PI / 20, y: 0, z: 0 },
  scale: { x: 50, y: 50, z: 50 },
};
const LAPTOP_ROTATION_SCALARS = { x: 0.025, y: 0.05 };
const LAPTOP_LID_ROTATION_X = { close: Math.PI / 2, open: 0 };
const LAPTOP_SCENE_CAMERA_INIT_Z_POSITION = 750;
const SLIDE_PIXELATION_THRESHOLD = 0.5;
const BACKGROUND_DOT_SIZE = {
  height: 10,
  width: 6,
};
const INFO_POPUP_WAIT_TIME_SECONDS = 10;
const INFO_POPUP_MAX_HOVER_COUNT = 3;
const PIXELATION_MIN = 0;
const PIXELATION_MAX = 40;
const MOBILE_BREAKPOINT_MAX_WIDTH = 768;

const SlideLocation = {
  LEFT: "LEFT",
  CENTER: "CENTER",
  RIGHT: "RIGHT",
};

const Projects = {
  CINESPACE: "CINESPACE",
  SIRIUS_XM: "SIRIUS_XM",
  SPOTLIGHT: "SPOTLIGHT",
};

const ProjectUrls = {
  [Projects.CINESPACE]: "https://cinespace.com",
  [Projects.SIRIUS_XM]: "https://podcastreport2022.siriusxmmedia.com",
  [Projects.SPOTLIGHT]: "https://spotlight.com",
};

const ProjectImages = {
  [Projects.CINESPACE]: "images/cinespace.jpg",
  [Projects.SIRIUS_XM]: "images/sirius-xm.jpg",
  [Projects.SPOTLIGHT]: "images/spotlight.jpg",
};

const MouseActions = {
  COPY_EMAIL: "copy email",
  OPEN_LINK: "open link",
  SCROLL_DOWN: "scroll down",
  SCROLL_TO_TOP: "scroll to top",
  VIEW_SITE: "view site",
};

const SceneType = {
  ASCII_LOGO: "ASCII_LOGO",
  LAPTOP: "LAPTOP",
};

// ------------------------------------
// --- device orientation controls ----
// ------------------------------------

// modified from old three.js code:
// https://github.com/mrdoob/three.js/blob/e62b253081438c030d6af1ee3c3346a89124f277/examples/jsm/controls/DeviceOrientationControls.js

const _zee = new THREE.Vector3(0, 0, 1);
const _euler = new THREE.Euler();
const _q0 = new THREE.Quaternion();
const _q1 = new THREE.Quaternion(-Math.sqrt(0.5), 0, 0, Math.sqrt(0.5)); // - PI/2 around the x-axis
const _changeEvent = { type: "change" };
const _rotationOrder = "YXZ";

class DeviceOrientationControls extends THREE.EventDispatcher {
  constructor(object, sceneType) {
    super();

    this.sceneType = sceneType;

    if (window.isSecureContext === false) {
      console.error(
        "THREE.DeviceOrientationControls: DeviceOrientationEvent is only available in secure contexts (https)"
      );
    }

    const scope = this;

    const EPS = 0.000001;
    const lastQuaternion = new THREE.Quaternion();

    this.object = object;

    this.object.rotation.reorder(_rotationOrder);

    this.enabled = true;

    this.deviceOrientation = {};
    this.screenOrientation = 0;

    const onDeviceOrientationChangeEvent = function (event) {
      scope.deviceOrientation = event;
    };

    const onScreenOrientationChangeEvent = function () {
      // update this to use screen.orientation
      // https://developer.mozilla.org/en-US/docs/Web/API/Screen/orientation
      scope.screenOrientation = window.orientation || 0;
    };

    const setObjectQuaternion = function (object, alpha, beta, gamma, orient) {
      _euler.set(beta, alpha, -gamma, _rotationOrder);
      object.quaternion.setFromEuler(_euler);
      object.quaternion.multiply(_q1);
      object.quaternion.multiply(_q0.setFromAxisAngle(_zee, -orient));

      if (scope.sceneType === SceneType.ASCII_LOGO) {
        object.rotation.x += ASCII_LOGO_INIT.rotation.x;
        object.rotation.y += ASCII_LOGO_INIT.rotation.y;
        object.rotation.z += ASCII_LOGO_INIT.rotation.z;
      } else if (scope.sceneType === SceneType.LAPTOP) {
        object.rotation.x += LAPTOP_INIT.rotation.x;
        object.rotation.y += LAPTOP_INIT.rotation.y;
        object.rotation.z += LAPTOP_INIT.rotation.z;
      }
    };

    this.connect = function () {
      onScreenOrientationChangeEvent();

      if (
        window.DeviceOrientationEvent !== undefined &&
        typeof window.DeviceOrientationEvent.requestPermission === "function"
      ) {
        window.DeviceOrientationEvent.requestPermission()
          .then(function (response) {
            if (response == "granted") {
              window.addEventListener(
                "orientationchange",
                onScreenOrientationChangeEvent
              );
              window.addEventListener(
                "deviceorientation",
                onDeviceOrientationChangeEvent
              );
            }
          })
          .catch(function (error) {
            console.error(
              "THREE.DeviceOrientationControls: Unable to use DeviceOrientation API:",
              error
            );
          });
      } else {
        window.addEventListener(
          "orientationchange",
          onScreenOrientationChangeEvent
        );
        window.addEventListener(
          "deviceorientation",
          onDeviceOrientationChangeEvent
        );
      }

      scope.enabled = true;
    };

    this.disconnect = function () {};

    this.update = function () {
      if (scope.enabled === false) {
        return;
      }

      const isLaptop = scope.sceneType === SceneType.LAPTOP;
      const isAsciiLogo = scope.sceneType === SceneType.ASCII_LOGO;

      const device = scope.deviceOrientation;
      const a = device.alpha || 0;
      const b = device.beta || 0;
      const g = device.gamma || 0;
      const o = scope.screenOrientation || 0;

      const aMagnitude = a > 180 ? a - 360 : a;
      const bMagnitude = b - 90;

      let SCALAR = 1;
      if (isAsciiLogo) {
        SCALAR = 0.6;
      } else if (isLaptop) {
        SCALAR = 0.4;
      }

      const aScaled = aMagnitude * (isAsciiLogo ? SCALAR : 1);
      const bScaled = bMagnitude * SCALAR;
      const gScaled = g * (isAsciiLogo ? SCALAR : 1);

      const aWithDirection = aScaled < 0 ? 360 + aScaled : aScaled;
      const bWithDirection = 90 + bScaled;

      if (device) {
        setObjectQuaternion(
          scope.object,
          THREE.MathUtils.degToRad(aWithDirection),
          THREE.MathUtils.degToRad(bWithDirection),
          THREE.MathUtils.degToRad(gScaled),
          THREE.MathUtils.degToRad(o)
        );

        if (8 * (1 - lastQuaternion.dot(scope.object.quaternion)) > EPS) {
          lastQuaternion.copy(scope.object.quaternion);
          scope.dispatchEvent(_changeEvent);
        }
      }
    };

    this.dispose = function () {
      scope.disconnect();
    };

    this.connect();
  }
}

// ------------------------------------
// ------------ math utils ------------
// ------------------------------------

const getValueInRangeFromPercentage = (percentage, [start, end]) =>
  percentage * (end - start) + start;

const getPercentageInRangeFromValue = (value, [start, end]) =>
  (value - start) / (end - start);

const clampWithinRange = (value, [start, end]) =>
  Math.max(start, Math.min(value, end));

const roundToDecimalPlace = (value, numPlaces) =>
  Math.round((value + Number.EPSILON) * Math.pow(10, numPlaces)) /
  Math.pow(10, numPlaces);

// start: inclusive, end: exclusive
const range = (end, start = 0) =>
  [...Array(end).keys()].filter((num) => num >= start);

const wait = (seconds) =>
  new Promise((resolve) => setTimeout(resolve, seconds * 1000));

// ------------------------------------
// ---------- styling utils -----------
// ------------------------------------

const getWindowSize = () => ({
  height: window.innerHeight,
  width: window.innerWidth,
});

const getElementSize = (element) => ({
  width: element.offsetWidth,
  height: element.offsetHeight,
});

const applyStyles = (element, styles) => {
  Object.entries(styles).forEach(([property, value]) => {
    element.style[property] = value;
  });
};

const parseTransformAttributeValue = (element) => {
  const value = element.style.transform;
  const functions = value.split(" ");

  return Object.fromEntries(
    functions
      .map((fxn) => {
        if (!fxn) {
          return undefined;
        }

        const functionName = fxn.split("(")[0];
        const functionValue = parseFloat(fxn.split("(")[1].split("px")[0]);
        return isNaN(functionValue) ? undefined : [functionName, functionValue];
      })
      .filter((formattedFxn) => !!formattedFxn)
  );
};

const isInMobileBreakpoint = () =>
  getWindowSize().width <= MOBILE_BREAKPOINT_MAX_WIDTH;

// ------------------------------------
// ---------- three.js utils ----------
// ------------------------------------

const createPointLight = (intensity, x, y, z) => {
  const pointLight = new THREE.PointLight(0xffffff, intensity, 0, 0);
  pointLight.position.set(x, y, z);
  return pointLight;
};

const createCamera = (z, container) => {
  const { height, width } = getElementSize(container);

  const camera = new THREE.PerspectiveCamera(70, width / height, 1, 1000);
  camera.position.set(0, 0, z);

  return camera;
};

const createScene = (background) => {
  const s = new THREE.Scene();

  if (background) {
    s.background = background;
  }

  return s;
};

const createRenderer = (container, alpha) => {
  const { height, width } = getElementSize(container);
  const highDpr = window.devicePixelRatio > 1;

  const renderer = new THREE.WebGLRenderer({
    alpha,
    antialias: !highDpr,
    powerPreference: "high-performance",
  });
  renderer.setPixelRatio(window.devicePixelRatio);
  renderer.setSize(width, height);

  return renderer;
};

const createCss3dRenderer = () => {
  const { height, width } = getWindowSize();

  const r = new CSS3DRenderer();
  r.setSize(width, height);
  r.domElement.style.position = "absolute";
  r.domElement.style.top = 0;

  return r;
};

const createRendererWithAsciiShader = (
  container,
  charSet,
  resolution,
  invert,
  textColor,
  backgroundColor
) => {
  const { height, width } = getElementSize(container);
  const renderer = createRenderer(container);

  const effect = new AsciiEffect(renderer, charSet, { resolution, invert });
  effect.setSize(width, height);
  applyStyles(effect.domElement, { backgroundColor, color: textColor });

  return effect;
};

const createRaycaster = () => new THREE.Raycaster();

const addCss3dToObject = (container, obj) => {
  const containerClone = container.cloneNode(true);
  container.remove();

  const css3dObject = new CSS3DObject(containerClone);
  obj.css3dObject = css3dObject;
  obj.add(css3dObject);

  // make an invisible plane for the DOM element to chop
  // clip a WebGL geometry with it.
  obj.material = new THREE.MeshPhongMaterial({
    opacity: 0.15,
    color: new THREE.Color(0x111111),
    blending: THREE.NoBlending,
  });

  const { max, min } = obj.geometry.boundingBox;
  obj.geometry = new THREE.BoxGeometry(
    max.x - min.x,
    max.y - min.y,
    max.z - min.z + 0.2
  );
};

const connectRendererToDom = (scene) => {
  scene.container.appendChild(scene.renderer.domElement);
};

const renderScene = (scene, cameraFromOtherScene) => {
  scene.renderer.render(scene.scene, cameraFromOtherScene || scene.camera);
  scene.controls?.update();
};

const renderStats = () => {
  statsScene.update();
};

const updateRendererAndCameraSize = (scene, cameraFromOtherScene) => {
  const camera = cameraFromOtherScene || scene.camera;
  const { height, width } = getElementSize(scene.container);

  camera.aspect = width / height;
  camera.updateProjectionMatrix();
  scene.renderer.setSize(width, height);
};

// ------------------------------------
// --------- positioning utils --------
// ------------------------------------

const getJumbotronScolledPercentage = () => {
  const jumbotronPlaceholderHeight = getElementSize(
    placeholders.jumbotron
  ).height;

  return clampWithinRange(scrollPosition / jumbotronPlaceholderHeight, [0, 1]);
};

const getSelectedWorkSlideCount = () =>
  Math.round(
    getElementSize(placeholders.selectedWork).height /
      getElementSize(selectedWork).height
  );

const getScrolledPercentageWithinCurrentSlide = (slideIndex) => {
  const slideCount = getSelectedWorkSlideCount();
  const sectionStartPos = placeholders.selectedWork.offsetTop;
  const startPos =
    sectionStartPos +
    getElementSize(placeholders.selectedWork).height *
      (slideIndex / slideCount);
  const endPos =
    sectionStartPos +
    getElementSize(placeholders.selectedWork).height *
      ((slideIndex + 1) / slideCount);
  const scrolledPercentage = getPercentageInRangeFromValue(scrollPosition, [
    startPos,
    endPos,
  ]);

  return scrolledPercentage >= 0 && scrolledPercentage <= 1
    ? scrolledPercentage
    : undefined;
};

const getCurrentSlide = () => {
  const slideCount = getSelectedWorkSlideCount();
  const slidesPercentageScrolled = range(slideCount).map((index) =>
    getScrolledPercentageWithinCurrentSlide(index)
  );

  const index = slidesPercentageScrolled.findIndex(
    (percentageScrolled) => percentageScrolled !== undefined
  );
  const percentage = slidesPercentageScrolled[index];

  return { index, percentage };
};

const getCurrentHoverableProject = () => {
  const currentSlide = getCurrentSlide();
  let currentProject;

  if (
    currentSlide.index === 1 ||
    (currentSlide.index === 2 &&
      currentSlide.percentage <= SLIDE_PIXELATION_THRESHOLD)
  ) {
    currentProject = Projects.CINESPACE;
  } else if (
    (currentSlide.index === 3 &&
      currentSlide.percentage > SLIDE_PIXELATION_THRESHOLD) ||
    (currentSlide.index === 4 &&
      currentSlide.percentage <= SLIDE_PIXELATION_THRESHOLD)
  ) {
    currentProject = Projects.SPOTLIGHT;
  } else if (
    (currentSlide.index === 5 &&
      currentSlide.percentage > SLIDE_PIXELATION_THRESHOLD) ||
    (currentSlide.index === 6 &&
      currentSlide.percentage <= SLIDE_PIXELATION_THRESHOLD)
  ) {
    currentProject = Projects.SIRIUS_XM;
  }

  return currentProject;
};

const isLoadingComplete = () => displayedTotalLoadingPercentage === 100;

// only render after loading screen if scrolled 50% through jumbotron
const shouldRenderAsciiLogoScene = () =>
  isLoadingComplete() && getJumbotronScolledPercentage() < 0.5;

// only render after loading screen if 50% scrolled through jumbotron or past jumbotron
const shouldRenderLaptopScene = () =>
  isLoadingComplete() && getJumbotronScolledPercentage() > 0.5;

// ------------------------------------
// ---------- main functions ----------
// ------------------------------------

const initPage = () => {
  if (history.scrollRestoration) {
    history.scrollRestoration = "manual";
  } else {
    window.onbeforeunload = function () {
      window.scrollTo(0, 0);
    };
  }
  html.style.scrollBehavior = "smooth";

  if (IS_TOUCH_DEVICE) {
    document.body.classList.add("is-touch-device");
  }

  if (IS_CHROME) {
    document.body.classList.add("is-chrome");
  }

  if (IS_FIREFOX) {
    document.body.classList.add("is-firefox");
  }
};

const initImageLoaders = () => {
  const imageUrls = Object.values(ProjectImages);
  imageUrls.forEach((url) => {
    const img = new Image();
    img.onload = function () {
      currentLoadingPercentages.images += 1 / imageUrls.length;
    };
    img.src = url;
  });
};

const load3DModels = async () => {
  const gltfLoader = new GLTFLoader();
  const dracoLoader = new DRACOLoader();

  dracoLoader.setDecoderPath(DRACO_DECODER_URL);
  gltfLoader.setDRACOLoader(dracoLoader);

  asciiLogoScene.geometryFile = await gltfLoader.loadAsync(
    ASCII_LOGO_FILE,
    (progress) => {
      console.log(progress.loaded);
      currentLoadingPercentages.ascii =
        progress.loaded / ASCII_LOGO_FILE_SIZE_BYTES;
    }
  );

  laptopScene.geometryFile = await gltfLoader.loadAsync(
    LAPTOP_FILE,
    (progress) => {
      currentLoadingPercentages.laptop =
        progress.loaded / LAPTOP_FILE_SIZE_BYTES;
    }
  );
};

const createAsciiLogoMesh = (geometryFile) => {
  const mesh = geometryFile.scene;
  mesh.position.set(0, 0, 0);
  mesh.rotation.set(0, 0, 0);
  mesh.scale.set(1, 1, 1);

  mesh.castShadow = true;
  mesh.receiveShadow = true;

  return mesh;
};

const createLaptopMesh = (geometryFile) => {
  const base = geometryFile.scene;
  base.children[1].material = new THREE.MeshPhongMaterial({
    color: 0x1a1a1a,
    emissive: 0x000000,
    specular: 0x111111,
    shininess: 100,
  });
  const lid = base.children[0];
  const screen = lid.children[0].children[2];

  base.position.set(
    LAPTOP_INIT.position.x,
    LAPTOP_INIT.position.y,
    LAPTOP_INIT.position.z
  );
  base.rotation.set(
    LAPTOP_INIT.rotation.x,
    LAPTOP_INIT.rotation.y,
    LAPTOP_INIT.rotation.z
  );
  base.scale.set(LAPTOP_INIT.scale.x, LAPTOP_INIT.scale.y, LAPTOP_INIT.scale.z);
  base.castShadow = true;
  base.receiveShadow = true;

  return { base, lid, screen };
};

const initAllScenes = () => {
  const { height: vh, width: vw } = getWindowSize();
  const screenPixelArea = vw * vh;

  // ascii logo scene

  const asciiShaderResolution =
    0.18 - 0.00000005 * Math.max(screenPixelArea - 1500000, 0);

  asciiLogoScene.container = asciiLogoContainer;
  asciiLogoScene.mesh = createAsciiLogoMesh(asciiLogoScene.geometryFile);
  asciiLogoScene.scene = createScene(new THREE.Color(0, 0, 0));
  asciiLogoScene.renderer = createRendererWithAsciiShader(
    asciiLogoScene.container,
    ".:-+*=%@#&",
    asciiShaderResolution,
    true,
    "var(--black)",
    "var(--white)"
  );
  asciiLogoScene.camera = createCamera(
    ASCII_LOGO_SCENE_CAMERA_Z_POS,
    asciiLogoScene.container
  );

  asciiLogoScene.scene.add(createPointLight(3, 0, 0, 500), asciiLogoScene.mesh);
  connectRendererToDom(asciiLogoScene);

  // laptop scene

  laptopScene.container = laptopContainer;
  laptopScene.mesh = createLaptopMesh(laptopScene.geometryFile);
  addCss3dToObject(laptopScreenContainer, laptopScene.mesh.screen);

  laptopScene.scene = createScene();
  laptopScene.renderer = createRenderer(laptopScene.container, true);
  laptopScene.camera = createCamera(
    LAPTOP_SCENE_CAMERA_INIT_Z_POSITION,
    laptopScene.container
  );
  laptopScene.raycaster = createRaycaster();

  laptopScene.scene.add(
    createPointLight(3.5, 0, 700, 750),
    createPointLight(0.05, -300, 100, 100),
    laptopScene.mesh.base
  );
  connectRendererToDom(laptopScene);

  // laptop screen scene

  laptopScreenScene.container = laptopScreen;
  laptopScreenScene.mesh = laptopScene.mesh.screen.css3dObject;
  laptopScreenScene.scene = createScene();
  laptopScreenScene.renderer = createCss3dRenderer();

  laptopScreenScene.scene.add(laptopScreenScene.mesh);
  connectRendererToDom(laptopScreenScene);

  // stats scene

  const searchParams = new URLSearchParams(window.location.search);
  const isDebug = searchParams.get("debug") === "true";

  if (isDebug) {
    statsScene = new Stats();
    document.body.appendChild(statsScene.dom);
  }
};

const renderLoop = () => {
  const newScrollPosition = window.scrollY;

  if (scrollPosition !== newScrollPosition) {
    scrollPosition = newScrollPosition;
    onScroll();
  }

  if (shouldRenderLaptopScene()) {
    renderScene(laptopScene);
    renderScene(laptopScreenScene, laptopScene.camera);
    if (IS_TOUCH_DEVICE) {
      syncLaptopScreen();
    }
  }

  if (shouldRenderAsciiLogoScene()) {
    renderScene(asciiLogoScene);
    updateAsciiLogoRotation();
  }

  if (statsScene) {
    renderStats();
  }

  requestAnimationFrame(renderLoop);
};

const setMousePosition = (mouseOrTouchEvent, isTouch) => {
  const { height: vh, width: vw } = getWindowSize();
  const { x, y } = mousePosition;

  let eventClientX;
  if (mouseOrTouchEvent && isTouch) {
    eventClientX = mouseOrTouchEvent.changedTouches[0].clientX;
  } else if (mouseOrTouchEvent && !isTouch) {
    eventClientX = mouseOrTouchEvent.clientX;
  }

  let eventClientY;
  if (mouseOrTouchEvent && isTouch) {
    eventClientY = mouseOrTouchEvent.changedTouches[0].clientY;
  } else if (mouseOrTouchEvent && !isTouch) {
    eventClientY = mouseOrTouchEvent.clientY;
  }

  mousePosition.x = eventClientX || Math.min(x, vw);
  mousePosition.y = eventClientY || Math.min(y, vh);

  setCursorSizeAndPosition();
};

const updateMouseAction = (action, hoveredProject) => {
  const { action: prevMouseAction } = mousePosition;
  mousePosition.action = action || null;
  mousePosition.hoveredProject = hoveredProject;

  if (action && !prevMouseAction) {
    if (action === MouseActions.VIEW_SITE && hoveredProject) {
      cursorAction.innerHTML = `${action}<a href="${
        ProjectUrls[mousePosition.hoveredProject]
      }" target="_blank"></a>`;
    } else if (action !== MouseActions.VIEW_SITE) {
      cursorAction.innerText = action;
    }
  } else if (!action) {
    cursorAction.innerText = "";
  }
};

const setCursorSizeAndPosition = () => {
  const { action, clicked, x, y } = mousePosition;
  const CURSOR_SIZE = 16;
  const CURSOR_ACTION_SIZE = 56;

  applyStyles(cursor, {
    translate: `${x - CURSOR_SIZE / 2}px ${y - CURSOR_SIZE / 2}px 0`,
    scale: clicked ? 0.75 : 1,
  });
  applyStyles(cursorAction, {
    translate: `${x - CURSOR_ACTION_SIZE / 2}px ${
      y - CURSOR_ACTION_SIZE / 2
    }px 0`,
    scale: action ? (clicked ? 0.9 : 1) : 0,
  });
};

// rotate 3D model based on mouse position
const updateAsciiLogoRotation = () => {
  const percentageScrolled = getJumbotronScolledPercentage();
  const { x: initX, y: initY, z: initZ } = ASCII_LOGO_INIT.rotation;

  if (!shouldRenderAsciiLogoScene()) {
    return;
  }

  // if controls for scene exist, it's using those to control the mesh rotation
  if (asciiLogoScene.controls) {
    return;
  }

  // if touch device but controls not connected, auto rotate
  if (IS_TOUCH_DEVICE) {
    const timer = Date.now() - START_TIME;
    asciiLogoScene.mesh.rotation.set(
      initX +
        Math.sin(timer * ASCII_AUTO_ROTATION_SPEED) *
          ASCII_AUTO_ROTATION_MAX_DIST,
      initY,
      initZ +
        Math.cos(timer * ASCII_AUTO_ROTATION_SPEED) *
          ASCII_AUTO_ROTATION_MAX_DIST
    );
    return;
  }

  const { height: vh, width: vw } = getWindowSize();
  const dampen =
    1 - getPercentageInRangeFromValue(percentageScrolled, [0, 0.5]);

  asciiLogoScene.mesh.rotation.set(
    initX +
      (Math.PI * (mousePosition.y / vh) * 2 - Math.PI) *
        ASCII_LOGO_ROTATION_SCALAR *
        dampen,
    initY,
    initZ +
      (Math.PI * (mousePosition.x / vw) * 2 - Math.PI) *
        ASCII_LOGO_ROTATION_SCALAR *
        dampen *
        -1
  );
};

// rotate 3D model based on mouse position
const updateLaptopRotation = () => {
  if (!shouldRenderLaptopScene()) {
    return;
  }

  // if controls for scene exist, it's using those to control the mesh rotation
  if (laptopScene.controls) {
    return;
  }

  const { x: initX, y: initY, z: initZ } = LAPTOP_INIT.rotation;

  // if touch device but controls not connected, set to default position
  if (IS_TOUCH_DEVICE) {
    laptopScene.mesh.base.rotation.set(initX, initY, initZ);
    return;
  }

  const { height: vh, width: vw } = getWindowSize();
  const { x: scalarX, y: scalarY } = LAPTOP_ROTATION_SCALARS;
  const { x: mouseX, y: mouseY } = mousePosition;

  laptopScene.mesh.base.rotation.set(
    initX + (Math.PI * 2 * (mouseY / vh) - Math.PI) * scalarX,
    initY + (Math.PI * 2 * (mouseX / vw) - Math.PI) * scalarY,
    initZ
  );
};

const REFRESH_RATE_SECONDS = 0.05;
const MAX_PERCENTAGE = 100;
const updateLoadingPercentage = async () => {
  let totalPercentage = 0;

  while (totalPercentage < MAX_PERCENTAGE) {
    currentLoadingPercentages.fonts =
      document.fonts?.status === "loaded" ? 1 : 0;

    totalPercentage = Object.entries(currentLoadingPercentages)
      .map(([type, percentage]) => LOADING_WEIGHTS[type] * percentage)
      .reduce((a, b) => a + b);

    const maxLoaded = Math.round(totalPercentage * 100);
    const difference = maxLoaded - displayedTotalLoadingPercentage;
    let addedAmount = 0;
    if (difference > 30) {
      addedAmount = 5;
    } else if (difference > 20) {
      addedAmount = 2;
    } else if (difference > 0) {
      addedAmount = 1;
    }

    displayedTotalLoadingPercentage += addedAmount;
    loadingScreenPercentageValue.innerHTML = displayedTotalLoadingPercentage;

    if (displayedTotalLoadingPercentage === MAX_PERCENTAGE) {
      break;
    }

    await wait(REFRESH_RATE_SECONDS);
  }
};

const hideLoadingScreen = async () => {
  loadingScreen.classList.add("hide");
  await wait(2);
  loadingScreen.classList.add("anim-complete");
};

const checkScrolledPastJumbotronThreshold = () => {
  const threshold = getElementSize(jumbotron).height / 4;
  if (!hasScrolledPastJumbotronThreshold && scrollPosition > threshold) {
    hasScrolledPastJumbotronThreshold = true;
  }
};

const zoomTransitionJumbotronToSelectedWork = () => {
  const percentageScrolled = getJumbotronScolledPercentage();
  const opacityStart = 0.7;
  const opacityEnd = 1;
  const opacityPercentage =
    1 - (percentageScrolled - opacityStart) / (opacityEnd - opacityStart);
  const scalePercentage = getValueInRangeFromPercentage(percentageScrolled, [
    1,
    // reduced scaling to improve performance on mobile
    IS_TOUCH_DEVICE ? 10 : 30,
  ]);

  if (percentageScrolled === 1 && !infoPopupWaitStatus) {
    revealInfoPopup();
  }

  applyStyles(jumbotron, {
    opacity: clampWithinRange(
      percentageScrolled < 0.7 ? 1 : opacityPercentage,
      [0, 1]
    ),
    pointerEvents: percentageScrolled < 0.7 ? "auto" : "none",
    // temp fix since Safari pixelates text when using transform scale
    ...(IS_CHROME || IS_FIREFOX
      ? {
          transform: `scale(${Math.pow(scalePercentage, 2)})`,
        }
      : {
          // translate3d needed so it'll use GPU acceleration for this element
          transform: `translate3d(0, 0, 0) scale(${Math.pow(
            scalePercentage,
            1.5
          )})`,
          filter: `blur(${Math.sqrt(percentageScrolled)}px)`,
        }),
  });
  applyStyles(asciiLogoMobileOverlay, {
    pointerEvents: percentageScrolled < 0.7 ? "all" : "none",
  });

  placeholders.jumbotron.style.backgroundColor = `color-mix(in srgb, var(--white), var(--light-gray) ${
    percentageScrolled * 100
  }%)`;
  placeholders.selectedWork.style.backgroundColor = `color-mix(in srgb, var(--white), var(--light-gray) ${
    percentageScrolled * 100
  }%)`;

  if (
    percentageScrolled === 1 &&
    !placeholders.selectedWork.classList.contains("with-shadow")
  ) {
    placeholders.selectedWork.classList.add("with-shadow");
  } else if (
    percentageScrolled < 1 &&
    placeholders.selectedWork.classList.contains("with-shadow")
  ) {
    placeholders.selectedWork.classList.remove("with-shadow");
  }
};

// keep laptop lid closed when selected work section has not been reached
const closeLaptopLid = () => {
  const sectionStartPosition = placeholders.selectedWork.offsetTop;
  const { lid } = laptopScene.mesh;

  if (scrollPosition < sectionStartPosition) {
    lid.rotation.set(LAPTOP_LID_ROTATION_X.close, 0, 0);
  }
};

const laptopLidEntrance = () => {
  const scrolledPercentage = getScrolledPercentageWithinCurrentSlide(0);

  if (scrolledPercentage === undefined) {
    return;
  }

  const lidRotationX = getValueInRangeFromPercentage(1 - scrolledPercentage, [
    LAPTOP_LID_ROTATION_X.open,
    LAPTOP_LID_ROTATION_X.close,
  ]);
  laptopScene.mesh.lid.rotation.set(lidRotationX, 0, 0);
  laptopScreen.style.filter = `brightness(${scrolledPercentage})`;

  selectedWorkSlides[0].style.opacity = 0;
};

const setImagePixelation = (currentSlideIndex, percentage) => {
  const currentImage = {
    [0]: "#pixelate-1",
    [1]: "#pixelate-2",
    [2]: "#pixelate-3",
  }[currentSlideIndex];

  if (!currentImage) {
    return;
  }

  const rawSize = getValueInRangeFromPercentage(percentage, [
    PIXELATION_MIN,
    PIXELATION_MAX,
  ]);
  const size = roundToDecimalPlace(rawSize, 1);

  const image = document.querySelector(`${currentImage} + image`);
  const composite = document.querySelector(
    `${currentImage} feComposite.pixel-size`
  );
  const morphology = document.querySelector(`${currentImage} feMorphology`);

  image.setAttribute("filter", size < 0.5 ? "" : `url(${currentImage})`);
  composite.setAttribute("width", size * 2);
  composite.setAttribute("height", size * 2);
  morphology.setAttribute("radius", size);
};

const slideLaptop = (slideIndex, origin, destination) => {
  const ROTATION_Y_SCALAR = Math.PI / 12;
  const TRANSLATE_X_SCALAR = 0.325;
  const LAPTOP_3D_MODEL_WIDTH = 100;
  const SLIDE_TEXT_TRANSFORM_SCALAR = 20;

  const { height: vh, width: vw } = getWindowSize();
  const percentageScrolledThroughSection =
    getScrolledPercentageWithinCurrentSlide(slideIndex);

  if (percentageScrolledThroughSection === undefined) {
    return;
  }

  if (isInMobileBreakpoint()) {
    const percentage =
      destination === SlideLocation.CENTER
        ? 1 - percentageScrolledThroughSection
        : percentageScrolledThroughSection;

    // laptop positioning
    const translation = `translateY(${
      (slideIndex === 1 ? percentage : 1) * vh * 0.2 * -1
    }px)`;
    laptopContainer.style.transform = translation;
    laptopScreen.style.transform = translation;

    // slide 1
    let slide1Opacity = 0;
    let slide1Transform = 0;
    if (slideIndex === 1) {
      const slide1Percentage = clampWithinRange(
        getPercentageInRangeFromValue(percentage, [0.5, 1]),
        [0, 1]
      );
      slide1Opacity = slide1Percentage;
      slide1Transform = (1 - slide1Percentage) * SLIDE_TEXT_TRANSFORM_SCALAR;
    } else if (slideIndex === 2) {
      if (percentage > 0.5) {
        slide1Opacity = 1;
      } else {
        slide1Opacity = clampWithinRange(
          getPercentageInRangeFromValue(percentage, [0, 0.5]),
          [0, 1]
        );
      }
    }

    // slide 2
    let slide2Opacity = 0;
    let slide2Transform = 0;
    if (slideIndex === 3) {
      const slide2Percentage = clampWithinRange(
        getPercentageInRangeFromValue(percentage, [0.5, 1]),
        [0, 1]
      );
      slide2Opacity = slide2Percentage;
      slide2Transform = (1 - slide2Percentage) * SLIDE_TEXT_TRANSFORM_SCALAR;
    } else if (slideIndex === 4) {
      if (percentage > 0.5) {
        slide2Opacity = 1;
      } else {
        slide2Opacity = clampWithinRange(
          getPercentageInRangeFromValue(percentage, [0, 0.5]),
          [0, 1]
        );
      }
    }

    // slide 3
    let slide3Opacity = 0;
    let slide3Transform = 0;
    if (slideIndex === 5) {
      const slide3Percentage = clampWithinRange(
        getPercentageInRangeFromValue(percentage, [0.5, 1]),
        [0, 1]
      );
      slide3Opacity = slide3Percentage;
      slide3Transform = (1 - slide3Percentage) * SLIDE_TEXT_TRANSFORM_SCALAR;
    }

    selectedWorkSlides[0].style.opacity = slide1Opacity;
    selectedWorkSlides[0].style.transform = `translateY(${slide1Transform}px)`;
    selectedWorkSlides[1].style.opacity = slide2Opacity;
    selectedWorkSlides[1].style.transform = `translateY(${slide2Transform}px)`;
    selectedWorkSlides[2].style.opacity = slide3Opacity;
    selectedWorkSlides[2].style.transform = `translateY(${slide3Transform}px)`;
  } else {
    const percentage =
      destination === SlideLocation.CENTER
        ? 1 - percentageScrolledThroughSection
        : percentageScrolledThroughSection;
    const direction =
      origin === SlideLocation.LEFT || destination === SlideLocation.LEFT
        ? 1
        : -1;

    const maxDist = vw * TRANSLATE_X_SCALAR;
    const revealBound = vw / 2 - maxDist - LAPTOP_3D_MODEL_WIDTH;

    selectedWorkSlides[0].style.padding = `0 ${revealBound}px 0 0`;
    selectedWorkSlides[1].style.padding = `0 0 0 ${revealBound}px`;
    selectedWorkSlides[2].style.padding = `0 ${revealBound}px 0 0`;

    // slide 1
    let slide1Opacity = 0;
    const slide1RevealPercentage = slideIndex === 3 ? percentage : 0;
    if (slideIndex === 1) {
      slide1Opacity = percentage;
    } else if (slideIndex === 2 || slideIndex === 3) {
      slide1Opacity = 1;
    }
    applyStyles(selectedWorkSlides[0], {
      opacity: slide1Opacity,
      clipPath: `inset(0 ${revealBound}px 0 ${
        (maxDist + LAPTOP_3D_MODEL_WIDTH) * slide1RevealPercentage
      }px)`,
    });
    laptopScene.mesh.lid.rotation.set(LAPTOP_LID_ROTATION_X.open, 0, 0);

    // slide 2
    let slide2RevealPercentage = 1;
    if (slideIndex === 2 || slideIndex === 5) {
      slide2RevealPercentage = percentage;
    } else if (slideIndex === 3 || slideIndex === 4) {
      slide2RevealPercentage = 0;
    }
    applyStyles(selectedWorkSlides[1], {
      clipPath: `inset(0 ${
        (maxDist + LAPTOP_3D_MODEL_WIDTH) * slide2RevealPercentage
      }px 0 ${revealBound}px)`,
    });

    // slide 3
    let slide3RevealPercentage = 1;
    if (slideIndex === 4) {
      slide3RevealPercentage = percentage;
    } else if (slideIndex === 5) {
      slide3RevealPercentage = 0;
    }
    applyStyles(selectedWorkSlides[2], {
      clipPath: `inset(0 ${revealBound}px 0 ${
        (maxDist + LAPTOP_3D_MODEL_WIDTH) * slide3RevealPercentage
      }px)`,
    });

    LAPTOP_INIT.rotation.y = ROTATION_Y_SCALAR * percentage * direction;
    updateLaptopRotation();

    const translation = `translateX(${
      maxDist * percentage * direction * -1
    }px)`;
    applyStyles(laptopContainer, { transform: translation });
    applyStyles(laptopScreen, { transform: translation });
  }
};

const updateScreenCurrentSlide = () => {
  const START = 0;
  const END = 1;
  const OPACITY_THRESHOLD = 0.75;

  if (!updatedScreenContent) {
    return;
  }

  const { index: slideIndex, percentage: percentageScrolledThroughSection } =
    getCurrentSlide();
  const slideImages = updatedScreenContent.querySelectorAll(".slide-image");
  let pixelationPercentage;

  if (slideIndex === 2) {
    pixelationPercentage =
      percentageScrolledThroughSection <= SLIDE_PIXELATION_THRESHOLD
        ? 0
        : getPercentageInRangeFromValue(percentageScrolledThroughSection, [
            SLIDE_PIXELATION_THRESHOLD,
            END,
          ]);
    const opacityPercentage =
      percentageScrolledThroughSection <= OPACITY_THRESHOLD
        ? 1
        : 1 -
          getPercentageInRangeFromValue(percentageScrolledThroughSection, [
            OPACITY_THRESHOLD,
            END,
          ]) /
            2;

    slideImages[0].style.opacity = opacityPercentage;
    slideImages[1].style.opacity = 1;
    slideImages[2].style.opacity = 1;
  } else if (slideIndex === 3) {
    pixelationPercentage =
      percentageScrolledThroughSection >= SLIDE_PIXELATION_THRESHOLD
        ? 0
        : 1 -
          getPercentageInRangeFromValue(percentageScrolledThroughSection, [
            START,
            SLIDE_PIXELATION_THRESHOLD,
          ]);
    const opacityPercentage =
      percentageScrolledThroughSection >= OPACITY_THRESHOLD
        ? 0
        : (1 -
            getPercentageInRangeFromValue(percentageScrolledThroughSection, [
              START,
              1 - OPACITY_THRESHOLD,
            ])) /
          2;

    slideImages[0].style.opacity = opacityPercentage;
    slideImages[1].style.opacity = 1;
    slideImages[2].style.opacity = 1;
  } else if (slideIndex === 4) {
    pixelationPercentage =
      percentageScrolledThroughSection <= SLIDE_PIXELATION_THRESHOLD
        ? 0
        : getPercentageInRangeFromValue(percentageScrolledThroughSection, [
            SLIDE_PIXELATION_THRESHOLD,
            END,
          ]);
    const opacityPercentage =
      percentageScrolledThroughSection <= OPACITY_THRESHOLD
        ? 1
        : 1 -
          getPercentageInRangeFromValue(percentageScrolledThroughSection, [
            OPACITY_THRESHOLD,
            END,
          ]) /
            2;

    slideImages[0].style.opacity = 0;
    slideImages[1].style.opacity = opacityPercentage;
    slideImages[2].style.opacity = 1;
  } else if (slideIndex === 5) {
    pixelationPercentage =
      percentageScrolledThroughSection >= SLIDE_PIXELATION_THRESHOLD
        ? 0
        : 1 -
          getPercentageInRangeFromValue(percentageScrolledThroughSection, [
            START,
            SLIDE_PIXELATION_THRESHOLD,
          ]);
    const opacityPercentage =
      percentageScrolledThroughSection >= OPACITY_THRESHOLD
        ? 0
        : (1 -
            getPercentageInRangeFromValue(percentageScrolledThroughSection, [
              START,
              1 - OPACITY_THRESHOLD,
            ])) /
          2;

    slideImages[0].style.opacity = 0;
    slideImages[1].style.opacity = opacityPercentage;
    slideImages[2].style.opacity = 1;
  }

  if (pixelationPercentage === undefined) {
    return;
  }

  // temp fix since Safari and Firefox both struggle to render SVG effects
  if (IS_CHROME) {
    setImagePixelation(0, pixelationPercentage);
    setImagePixelation(1, pixelationPercentage);
    setImagePixelation(2, pixelationPercentage);
  } else {
    const blur = `brightness(1.25) blur(${pixelationPercentage * 40}px)`;
    slideImages[0].style.filter = blur;
    slideImages[1].style.filter = blur;
    slideImages[2].style.filter = blur;
  }
};

const syncLaptopScreen = () => {
  const position = new THREE.Vector3();
  const quaternion = new THREE.Quaternion();
  laptopScene.mesh.screen.matrixWorld.decompose(
    position,
    quaternion,
    new THREE.Vector3()
  );

  laptopScreenScene.mesh.position.copy(position);
  laptopScreenScene.mesh.quaternion.copy(quaternion);
  laptopScreenScene.mesh.rotateOnAxis(
    new THREE.Vector3(1, 0, 0),
    (Math.PI / 2) * -1
  );
};

const showScrollDownIndicator = () => {
  setTimeout(() => {
    if (!hasScrolledPastJumbotronThreshold) {
      scrollDownIndicator.classList.remove("hidden");
    }
  }, 3000);
};

const syncFooterSize = () => {
  const { height } = getElementSize(footer);
  applyStyles(placeholders.footer, { height: `${height}px` });
};

const toggleEmailCarouselScroll = () => {
  footerCarouselTrack.classList.toggle("paused");
};

const resumeEmailCarouselScroll = () => {
  footerCarouselTrack.classList.remove("paused");
};

const revealInfoPopup = () => {
  infoPopupWaitStatus = "started";

  infoPopup = updatedScreenContent.querySelector(".info-popup");
  infoPopupText = infoPopup.querySelector(".text");

  setTimeout(() => {
    // show info popup
    if (laptopMeshHoverCount < INFO_POPUP_MAX_HOVER_COUNT) {
      infoPopupText.classList.remove("hide");
    }
    infoPopupWaitStatus = "completed";
  }, INFO_POPUP_WAIT_TIME_SECONDS * 1000);
};

const hideInfoPopup = () => {
  infoPopupHiddenAfterStarted = true;
  infoPopup.classList.add("hide");
};

const updateInfoPopupVisibility = () => {
  if (!infoPopup || infoPopupHiddenAfterStarted) {
    return;
  }

  const currentProject = getCurrentHoverableProject();
  const currentVisibility = !infoPopup.classList.contains("hide");

  if (!currentVisibility && currentProject) {
    infoPopup.classList.remove("hide");
  } else if (currentVisibility && !currentProject) {
    infoPopup.classList.add("hide");
  }
};

const laptopHover = () => {
  const { height: vh, width: vw } = getWindowSize();
  const { x: mouseX, y: mouseY, action: mouseAction } = mousePosition;
  const currentProject = getCurrentHoverableProject();

  if (!currentProject) {
    if (mouseAction === MouseActions.VIEW_SITE) {
      updateMouseAction();
    }

    return;
  }

  const { translateX, translateY } =
    parseTransformAttributeValue(laptopContainer);
  const { top } = selectedWork.getBoundingClientRect();

  const raycastCoords = new THREE.Vector2(
    ((mouseX - (translateX || 0)) / vw) * 2 - 1,
    -((mouseY - (translateY || 0) - top) / vh) * 2 + 1
  );
  laptopScene.raycaster.setFromCamera(raycastCoords, laptopScene.camera);
  const rayIntersections = laptopScene.raycaster.intersectObject(
    laptopScene.mesh.base,
    true
  );

  if (rayIntersections.length > 0) {
    updateMouseAction(MouseActions.VIEW_SITE, currentProject);
    if (!laptopMeshHovering) {
      laptopMeshHovering = true;
      if (infoPopupWaitStatus === "completed" && !infoPopupHiddenAfterStarted) {
        hideInfoPopup();
      } else if (laptopMeshHoverCount < INFO_POPUP_MAX_HOVER_COUNT) {
        laptopMeshHoverCount += 1;
      }
    }
  } else if (mouseAction === MouseActions.VIEW_SITE) {
    updateMouseAction();
    if (laptopMeshHovering) {
      laptopMeshHovering = false;
    }
  }
};

const generateFooterBackground = () => {
  const { height: dotHeight, width: dotWidth } = BACKGROUND_DOT_SIZE;
  const footerWidth = footerBackground.offsetWidth;
  const footerHeight = footerBackground.offsetHeight;
  const numDotRows = Math.ceil(footerWidth / dotWidth);
  const numDotColumns = Math.ceil(footerHeight / dotHeight);

  footerBackground.innerText = ".".repeat(numDotRows * numDotColumns);
};

const scrollToTop = () => window.scroll({ top: 0, behavior: "smooth" });

const initEventListeners = () => {
  if (IS_TOUCH_DEVICE) {
    onTouch(document);
  } else {
    document.addEventListener("mousemove", onMouseMove);
    document.addEventListener("mousedown", onGlobalMouseDown);
    document.addEventListener("mouseup", onGlobalMouseUp);
    jumbotronDescriptionLink.addEventListener(
      "mouseenter",
      onJumbotronDescriptionLinkMouseEnter
    );
    jumbotronDescriptionLink.addEventListener(
      "mouseleave",
      onJumbotronDescriptionLinkMouseLeave
    );
    footerEmailLinks.forEach((link) => {
      link.addEventListener("mouseenter", onFooterEmailLinkMouseEnter);
      link.addEventListener("mouseleave", onFooterEmailLinkMouseLeave);
    });
    footerLogo.addEventListener("click", onFooterLogoClick);
    footerLogo.addEventListener("mouseenter", onFooterLogoMouseEnter);
    footerLogo.addEventListener("mouseleave", onFooterLogoMouseLeave);
    footerSocialLinks.forEach((link) => {
      link.addEventListener("mouseenter", onFooterSocialLinkMouseEnter);
      link.addEventListener("mouseleave", onFooterSocialLinkMouseLeave);
    });
    scrollDownIndicator.addEventListener(
      "mouseenter",
      onScrollDownIndicatorMouseEnter
    );
    scrollDownIndicator.addEventListener(
      "mouseleave",
      onScrollDownIndicatorMouseLeave
    );
    scrollDownIndicator.addEventListener("click", onScrollDownIndicatorClick);
  }

  window.addEventListener("resize", onWindowResize);
};

const setAsciiLogoSizeInScreen = () => {
  const { width: vw } = getWindowSize();
  const z =
    ASCII_LOGO_SCENE_CAMERA_Z_POS +
    (MOBILE_BREAKPOINT_MAX_WIDTH - Math.min(vw, MOBILE_BREAKPOINT_MAX_WIDTH)) *
      0.03;

  asciiLogoScene.camera.position.z = z;
  asciiLogoScene.camera.updateProjectionMatrix();
};

const MAX_VW = 500;
const setLaptopSizeInScreen = () => {
  const { width: vw } = getWindowSize();
  const z =
    LAPTOP_SCENE_CAMERA_INIT_Z_POSITION *
    (1 + (1 - Math.min(vw / MAX_VW, 1)) * 0.8);

  laptopScene.camera.position.z = z;
  laptopScene.camera.updateProjectionMatrix();
};

const showMobileStartButton = async () => {
  await wait(0.75);
  loadingScreenMobileStartButton.classList.remove("hide");
};

// ------------------------------------
// ----- event listener functions -----
// ------------------------------------

// hide loading screen after everything is loaded
const onReadyStateChange = async (event) => {
  if (event.target.readyState === "complete") {
    await updateLoadingPercentage();
    if (IS_TOUCH_DEVICE && window.DeviceOrientationEvent) {
      await showMobileStartButton();
    } else {
      await hideLoadingScreen();
    }
    showScrollDownIndicator();
  }
};

const onMouseMove = (mouseEvent) => {
  setMousePosition(mouseEvent);
  if (isLoadingComplete()) {
    updateAsciiLogoRotation();
    updateLaptopRotation();
    syncLaptopScreen();
    laptopHover();
  }
};

const onScroll = () => {
  if (!updatedScreenContent) {
    updatedScreenContent = document.getElementById("screen-content");
  }

  if (IS_TOUCH_DEVICE) {
    updateMouseAction();
  }

  checkScrolledPastJumbotronThreshold();
  zoomTransitionJumbotronToSelectedWork();
  closeLaptopLid();
  laptopLidEntrance(); // slide 0
  slideLaptop(1, SlideLocation.CENTER, SlideLocation.LEFT);
  slideLaptop(2, SlideLocation.LEFT, SlideLocation.CENTER);
  slideLaptop(3, SlideLocation.CENTER, SlideLocation.RIGHT);
  slideLaptop(4, SlideLocation.RIGHT, SlideLocation.CENTER);
  slideLaptop(5, SlideLocation.CENTER, SlideLocation.LEFT);
  updateScreenCurrentSlide();
  updateAsciiLogoRotation();
  syncLaptopScreen();
  if (!IS_TOUCH_DEVICE) {
    laptopHover();
  }
  updateInfoPopupVisibility();
};

const onJumbotronDescriptionLinkMouseEnter = () => {
  updateMouseAction(MouseActions.OPEN_LINK);
};

const onJumbotronDescriptionLinkMouseLeave = () => {
  updateMouseAction();
};

const onFooterEmailLinkMouseEnter = () => {
  toggleEmailCarouselScroll();
  updateMouseAction(MouseActions.COPY_EMAIL);
};

const onFooterEmailLinkMouseLeave = () => {
  toggleEmailCarouselScroll();
  updateMouseAction();
};

const onFooterLogoClick = () => {
  scrollToTop();
};

const onFooterLogoMouseEnter = () => {
  updateMouseAction(MouseActions.SCROLL_TO_TOP);
};

const onFooterLogoMouseLeave = () => {
  updateMouseAction();
};

const onFooterSocialLinkMouseEnter = () => {
  updateMouseAction(MouseActions.OPEN_LINK);
};

const onFooterSocialLinkMouseLeave = () => {
  updateMouseAction();
};

const onScrollDownIndicatorMouseEnter = () => {
  updateMouseAction(MouseActions.SCROLL_DOWN);
};

const onScrollDownIndicatorMouseLeave = () => {
  updateMouseAction();
};

const onScrollDownIndicatorClick = () => {
  const distance = placeholders.jumbotron.offsetHeight;
  window.scrollTo({ left: 0, top: distance, behavior: "smooth" });
};

const onGlobalMouseDown = () => {
  mousePosition.clicked = true;
  setCursorSizeAndPosition(true);
};

const onGlobalMouseUp = () => {
  mousePosition.clicked = false;
  setCursorSizeAndPosition();
};

const onWindowResize = () => {
  setMousePosition();
  syncFooterSize();
  generateFooterBackground();
  updateRendererAndCameraSize(asciiLogoScene);
  updateRendererAndCameraSize(laptopScene);
  updateRendererAndCameraSize(laptopScreenScene, laptopScene.camera);
  setAsciiLogoSizeInScreen();
  setLaptopSizeInScreen();
};

const connectDeviceOrientationControls = () => {
  asciiLogoScene.controls = new DeviceOrientationControls(
    asciiLogoScene.mesh,
    SceneType.ASCII_LOGO
  );
  laptopScene.controls = new DeviceOrientationControls(
    laptopScene.mesh.base,
    SceneType.LAPTOP
  );
};

const onTouch = (element) => {
  let hasMoved = false;
  element.addEventListener("touchstart", () => {
    hasMoved = false;
  });
  element.addEventListener("touchmove", () => {
    hasMoved = true;
  });
  element.addEventListener("touchend", (e) => {
    const prevClickAction = mousePosition.action;
    const hasClickedScrollDownIndicator = !!e.target.closest(
      SCROLL_DOWN_INDICATOR_SELECTOR
    );
    const hasClickedFooterLogo = !!e.target.closest(FOOTER_LOGO_SELECTOR);

    if (hasMoved) {
      updateMouseAction();
      return;
    }

    if (prevClickAction) {
      resumeEmailCarouselScroll();
      updateMouseAction();
      setCursorSizeAndPosition();
      setTimeout(() => setMousePosition(e, true), 300);

      if (
        hasClickedScrollDownIndicator &&
        prevClickAction === MouseActions.SCROLL_DOWN
      ) {
        onScrollDownIndicatorClick();
      } else if (
        hasClickedFooterLogo &&
        prevClickAction === MouseActions.SCROLL_TO_TOP
      ) {
        onFooterLogoClick();
      }
    } else {
      setMousePosition(e, true);
      e.preventDefault();

      if (e.target.closest(FOOTER_EMAIL_LINKS_SELECTOR)) {
        toggleEmailCarouselScroll();
        updateMouseAction(MouseActions.COPY_EMAIL);
      } else if (
        e.target.closest(JUMBOTRON_DESCRIPTION_LINK_SELECTOR) ||
        e.target.closest(FOOTER_SOCIAL_LINKS_SELECTOR) ||
        e.target.closest(SELECTED_WORK_BUTTONS_SELECTOR)
      ) {
        updateMouseAction(MouseActions.OPEN_LINK);
      } else if (e.target.closest(SCROLL_DOWN_INDICATOR_SELECTOR)) {
        updateMouseAction(MouseActions.SCROLL_DOWN);
      } else if (e.target.closest(FOOTER_LOGO_SELECTOR)) {
        updateMouseAction(MouseActions.SCROLL_TO_TOP);
      }

      setCursorSizeAndPosition();
    }
  });
  loadingScreen.addEventListener("touchend", async () => {
    if (isLoadingComplete()) {
      connectDeviceOrientationControls();
      await hideLoadingScreen();
    }
  });
};

// ------------------------------------
// ------------------------------------
// ------------------------------------

initPage();
initImageLoaders();
initEventListeners();
document.addEventListener("readystatechange", onReadyStateChange);
load3DModels().then(() => {
  initAllScenes();
  renderLoop();
  syncLaptopScreen();
  syncFooterSize();
  generateFooterBackground();
  setAsciiLogoSizeInScreen();
  setLaptopSizeInScreen();
});
