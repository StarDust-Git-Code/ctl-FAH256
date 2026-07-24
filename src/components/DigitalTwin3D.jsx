import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { STLLoader } from 'three/examples/jsm/loaders/STLLoader.js';
import { ShieldCheck, AlertTriangle, Cpu, RotateCcw, Eye, Flame, Snowflake, Box, Palette, ZoomIn, ZoomOut, Maximize2 } from 'lucide-react';

export default function DigitalTwin3D({ shipment, onTriggerBreach, isDarkMode = true }) {
  const mountRef = useRef(null);
  const [simulatedTemp, setSimulatedTemp] = useState(shipment ? shipment.currentTemp : null);
  const [isTampered, setIsTampered] = useState(false);
  const [autoRotate, setAutoRotate] = useState(true);
  const [modelLoaded, setModelLoaded] = useState(false);
  const [selectedColorTheme, setSelectedColorTheme] = useState('cobalt');

  // References for Three.js objects
  const sceneRef = useRef(null);
  const cameraRef = useRef(null);
  const containerGroupRef = useRef(null);
  const stlMeshRef = useRef(null);
  const stlMaterialRef = useRef(null);
  const pointLightRef = useRef(null);

  // Color Themes Map
  const colorThemes = {
    cobalt: { name: 'Cobalt Metallic', hex: 0x1d4ed8, metalness: 0.85, roughness: 0.2 },
    titanium: { name: 'Titanium Graphite', hex: 0x475569, metalness: 0.9, roughness: 0.25 },
    emerald: { name: 'Cryo Emerald', hex: 0x059669, metalness: 0.8, roughness: 0.2 },
    amber: { name: 'Hazard Amber', hex: 0xd97706, metalness: 0.75, roughness: 0.3 },
  };

  useEffect(() => {
    if (shipment) {
      setSimulatedTemp(shipment.currentTemp);
    } else {
      setSimulatedTemp(null);
    }
  }, [shipment]);

  useEffect(() => {
    if (!mountRef.current) return;
    const width = mountRef.current.clientWidth;
    const height = mountRef.current.clientHeight || 340;

    // 1. Studio Scene Setup (Dark Space vs Studio Light)
    const scene = new THREE.Scene();
    sceneRef.current = scene;
    scene.background = new THREE.Color(isDarkMode ? 0x0b0f19 : 0xf8fafc);

    // 2. Camera setup - Positioned closer for a zoomed-in view of the model
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    camera.position.set(2.2, 1.4, 2.8);
    camera.lookAt(0, 0, 0);
    cameraRef.current = camera;

    // 3. Renderer setup
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.shadowMap.enabled = true;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.3;
    mountRef.current.appendChild(renderer.domElement);

    // 4. Cinematic 3-Point Lighting & Neon Accent Glow
    const ambientLight = new THREE.AmbientLight(0xffffff, isDarkMode ? 1.6 : 1.4);
    scene.add(ambientLight);

    const keyLight = new THREE.DirectionalLight(0xfff7ed, 2.8);
    keyLight.position.set(6, 8, 5);
    keyLight.castShadow = true;
    scene.add(keyLight);

    const rimLight = new THREE.DirectionalLight(0x38bdf8, 3.5);
    rimLight.position.set(-6, 4, -5);
    scene.add(rimLight);

    const fillLight = new THREE.DirectionalLight(0xc084fc, 1.8);
    fillLight.position.set(0, -4, 4);
    scene.add(fillLight);

    const isExcursion = simulatedTemp !== null && (simulatedTemp > (shipment ? shipment.maxSafeTemp : 6) || simulatedTemp < (shipment ? shipment.minSafeTemp : -80));
    const glowColor = isTampered || isExcursion ? 0xef4444 : 0x06b6d4;
    const pointLight = new THREE.PointLight(glowColor, 4.5, 10);
    pointLight.position.set(0, 1.2, 1.5);
    scene.add(pointLight);
    pointLightRef.current = pointLight;

    // 5. Main Container Group
    const containerGroup = new THREE.Group();
    scene.add(containerGroup);
    containerGroupRef.current = containerGroup;

    // 6. Load User's Custom STL Model (model.stl) - Zoomed & Prominent
    const stlLoader = new STLLoader();
    stlLoader.load(
      '/model.stl',
      (geometry) => {
        geometry.computeVertexNormals();
        geometry.center();
        geometry.computeBoundingBox();

        const box = geometry.boundingBox;
        const size = new THREE.Vector3();
        box.getSize(size);
        const maxDim = Math.max(size.x, size.y, size.z);
        const scale = 3.2 / maxDim;

        const theme = colorThemes[selectedColorTheme] || colorThemes.cobalt;
        const finalColor = isTampered || isExcursion ? 0xd97706 : theme.hex;

        const stlMat = new THREE.MeshStandardMaterial({
          color: finalColor,
          metalness: theme.metalness,
          roughness: theme.roughness,
        });
        stlMaterialRef.current = stlMat;

        const stlMesh = new THREE.Mesh(geometry, stlMat);
        stlMesh.scale.set(scale, scale, scale);
        stlMesh.rotation.set(-Math.PI / 2, 0, 0);

        stlMesh.castShadow = true;
        stlMesh.receiveShadow = true;

        containerGroup.add(stlMesh);
        stlMeshRef.current = stlMesh;
        setModelLoaded(true);
      },
      undefined,
      (err) => {
        console.warn("Could not load /model.stl, rendering fallback mesh", err);
        const fallbackGeo = new THREE.BoxGeometry(2.4, 1.4, 1.8);
        const fallbackMat = new THREE.MeshStandardMaterial({ color: 0x1d4ed8, metalness: 0.85, roughness: 0.2 });
        const fallbackMesh = new THREE.Mesh(fallbackGeo, fallbackMat);
        containerGroup.add(fallbackMesh);
      }
    );

    // Drag rotation & Mouse Wheel Zoom controls
    let isDragging = false;
    let previousMousePosition = { x: 0, y: 0 };

    const handleMouseDown = (e) => {
      isDragging = true;
      previousMousePosition = { x: e.clientX, y: e.clientY };
    };

    const handleMouseMove = (e) => {
      if (!isDragging || !containerGroup) return;
      const deltaX = e.clientX - previousMousePosition.x;
      const deltaY = e.clientY - previousMousePosition.y;

      containerGroup.rotation.y += deltaX * 0.008;
      containerGroup.rotation.x += deltaY * 0.008;
      previousMousePosition = { x: e.clientX, y: e.clientY };
    };

    const handleMouseUp = () => {
      isDragging = false;
    };

    const handleWheel = (e) => {
      e.preventDefault();
      if (!cameraRef.current) return;
      const zoomFactor = e.deltaY * 0.0015;
      cameraRef.current.position.multiplyScalar(1 + zoomFactor);
      const dist = cameraRef.current.position.length();
      if (dist < 1.2) cameraRef.current.position.setLength(1.2);
      if (dist > 8.0) cameraRef.current.position.setLength(8.0);
    };

    const domElem = mountRef.current;
    domElem.addEventListener('mousedown', handleMouseDown);
    domElem.addEventListener('wheel', handleWheel, { passive: false });
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);

    // Animation Loop
    let animationFrameId;
    let clock = new THREE.Clock();

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      const elapsedTime = clock.getElapsedTime();

      if (autoRotate && containerGroup && !isDragging) {
        containerGroup.rotation.y += 0.006;
      }

      if (pointLightRef.current) {
        pointLightRef.current.intensity = 3.8 + Math.sin(elapsedTime * 4) * 1.2;
      }

      renderer.render(scene, camera);
    };
    animate();

    const handleResize = () => {
      if (!mountRef.current) return;
      const w = mountRef.current.clientWidth;
      const h = mountRef.current.clientHeight || 340;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      if (domElem) {
        domElem.removeEventListener('mousedown', handleMouseDown);
        domElem.removeEventListener('wheel', handleWheel);
      }
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
      cancelAnimationFrame(animationFrameId);
      if (renderer.domElement && domElem.contains(renderer.domElement)) {
        domElem.removeChild(renderer.domElement);
      }
    };
  }, [autoRotate, isDarkMode]);

  // Update STL Material Color on Theme or Temperature Breach Change
  useEffect(() => {
    if (!stlMaterialRef.current) return;
    const isExcursion = simulatedTemp !== null && (simulatedTemp > (shipment ? shipment.maxSafeTemp : 6) || simulatedTemp < (shipment ? shipment.minSafeTemp : -80));
    const theme = colorThemes[selectedColorTheme] || colorThemes.cobalt;
    const colorHex = isTampered || isExcursion ? 0xef4444 : theme.hex;
    
    stlMaterialRef.current.color.setHex(colorHex);
    stlMaterialRef.current.metalness = theme.metalness;
    stlMaterialRef.current.roughness = theme.roughness;

    if (pointLightRef.current) {
      pointLightRef.current.color.setHex(isTampered || isExcursion ? 0xef4444 : 0x06b6d4);
    }
  }, [simulatedTemp, isTampered, selectedColorTheme, shipment]);

  const handleZoomIn = () => {
    if (!cameraRef.current) return;
    cameraRef.current.position.multiplyScalar(0.8);
    if (cameraRef.current.position.length() < 1.2) cameraRef.current.position.setLength(1.2);
  };

  const handleZoomOut = () => {
    if (!cameraRef.current) return;
    cameraRef.current.position.multiplyScalar(1.25);
    if (cameraRef.current.position.length() > 8.0) cameraRef.current.position.setLength(8.0);
  };

  const handleResetZoom = () => {
    if (!cameraRef.current) return;
    cameraRef.current.position.set(2.2, 1.4, 2.8);
    cameraRef.current.lookAt(0, 0, 0);
    if (containerGroupRef.current) {
      containerGroupRef.current.rotation.set(0, 0, 0);
    }
  };

  const handleBreachClick = () => {
    const newTemp = 14.5;
    setSimulatedTemp(newTemp);
    setIsTampered(true);
    if (onTriggerBreach) onTriggerBreach(newTemp);
  };

  const handleReset = () => {
    setSimulatedTemp(shipment ? shipment.currentTemp : null);
    setIsTampered(false);
    handleResetZoom();
  };

  return (
    <div className={`rounded-xl p-4 relative overflow-hidden transition-colors border ${
      isDarkMode ? 'bg-slate-900/90 border-slate-800 text-slate-100 shadow-xl' : 'bg-white border-slate-200 text-slate-800 shadow-xs'
    }`}>
      {/* Header bar */}
      <div className={`flex items-center justify-between mb-3 border-b pb-3 ${
        isDarkMode ? 'border-slate-800' : 'border-slate-100'
      }`}>
        <div className="flex items-center gap-2">
          <Box className="w-5 h-5 text-blue-500" />
          <span className="font-bold text-sm tracking-tight">
            3D DIGITAL TWIN (CUSTOM HARDWARE MODEL)
          </span>
          <span className={`text-xs px-2 py-0.5 rounded font-mono font-semibold border ${
            isDarkMode
              ? 'bg-blue-950/80 text-blue-400 border-blue-800'
              : 'bg-blue-50 text-blue-700 border-blue-200'
          }`}>
            {modelLoaded ? '✓ model.stl Active' : 'Loading STL...'}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span className={`inline-flex items-center gap-1 text-xs px-2.5 py-0.5 rounded-full font-mono font-bold ${
            isTampered || (simulatedTemp !== null && simulatedTemp > (shipment?.maxSafeTemp ?? 6))
              ? 'bg-red-950/80 text-red-400 border border-red-800 animate-pulse'
              : 'bg-emerald-950/80 text-emerald-400 border border-emerald-800'
          }`}>
            {isTampered || (simulatedTemp !== null && simulatedTemp > (shipment?.maxSafeTemp ?? 6)) ? (
              <><AlertTriangle className="w-3.5 h-3.5" /> BREACH DETECTED</>
            ) : (
              <><ShieldCheck className="w-3.5 h-3.5" /> SEAL INTEGRITY 100%</>
            )}
          </span>
        </div>
      </div>

      {/* 3D Canvas Studio Container */}
      <div className={`relative w-full h-[320px] rounded-lg overflow-hidden cursor-grab active:cursor-grabbing border ${
        isDarkMode ? 'bg-[#0b0f19] border-slate-800' : 'bg-slate-100 border-slate-200'
      }`}>
        <div ref={mountRef} className="w-full h-full" />

        {/* Studio Thermal Readout Card */}
        <div className={`absolute top-3 left-3 backdrop-blur-md border rounded-lg p-3 text-xs font-mono space-y-1 shadow-md ${
          isDarkMode ? 'bg-slate-900/90 border-slate-800 text-slate-100' : 'bg-white/90 border-slate-200 text-slate-800'
        }`}>
          <div className="text-slate-400 text-[10px] uppercase font-bold flex items-center justify-between gap-4">
            <span>Thermal Readout</span>
            <Cpu className="w-3.5 h-3.5 text-blue-500" />
          </div>
          <div className="text-xl font-black flex items-center gap-2">
            {simulatedTemp !== null ? (
              <>
                <span className={simulatedTemp > (shipment?.maxSafeTemp ?? 6) ? 'text-red-500' : 'text-blue-400'}>
                  {simulatedTemp.toFixed(1)}°C
                </span>
                {simulatedTemp < 0 ? (
                  <Snowflake className="w-4 h-4 text-blue-400 animate-spin" style={{ animationDuration: '6s' }} />
                ) : (
                  <Flame className="w-4 h-4 text-amber-500" />
                )}
              </>
            ) : (
              <span className="text-slate-500 text-base">--°C (No Payload)</span>
            )}
          </div>
          <div className="text-[11px] text-slate-400">
            Target Window: <span className={isDarkMode ? 'text-slate-200 font-semibold' : 'text-slate-900 font-semibold'}>{shipment ? `${shipment.minSafeTemp}°C to ${shipment.maxSafeTemp}°C` : 'N/A'}</span>
          </div>
        </div>

        {/* Interactive Zoom Controls & Color Palette Bar */}
        <div className="absolute bottom-3 right-3 flex items-center gap-2">
          {/* Zoom Buttons */}
          <div className={`backdrop-blur-md border rounded-lg p-1 shadow-md flex items-center gap-1 ${
            isDarkMode ? 'bg-slate-900/90 border-slate-800' : 'bg-white/90 border-slate-200'
          }`}>
            <button
              onClick={handleZoomIn}
              title="Zoom In (+)"
              className={`p-1 rounded transition ${isDarkMode ? 'hover:bg-slate-800 text-blue-400' : 'hover:bg-slate-100 text-blue-600'}`}
            >
              <ZoomIn className="w-4 h-4" />
            </button>
            <button
              onClick={handleZoomOut}
              title="Zoom Out (-)"
              className={`p-1 rounded transition ${isDarkMode ? 'hover:bg-slate-800 text-blue-400' : 'hover:bg-slate-100 text-blue-600'}`}
            >
              <ZoomOut className="w-4 h-4" />
            </button>
            <button
              onClick={handleResetZoom}
              title="Reset Camera View"
              className={`p-1 rounded transition border-l pl-1.5 ${isDarkMode ? 'hover:bg-slate-800 text-slate-400 border-slate-800' : 'hover:bg-slate-100 text-slate-600 border-slate-200'}`}
            >
              <Maximize2 className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Hardware Color Palette Picker */}
          <div className={`backdrop-blur-md border rounded-lg p-2 shadow-md flex items-center gap-1.5 text-xs ${
            isDarkMode ? 'bg-slate-900/90 border-slate-800' : 'bg-white/90 border-slate-200'
          }`}>
            <Palette className="w-3.5 h-3.5 text-slate-400 mr-1" />
            <button
              onClick={() => setSelectedColorTheme('cobalt')}
              title="Cobalt Metallic"
              className={`w-4 h-4 rounded-full bg-blue-600 border ${selectedColorTheme === 'cobalt' ? 'ring-2 ring-blue-500 scale-110' : 'opacity-80'}`}
            />
            <button
              onClick={() => setSelectedColorTheme('titanium')}
              title="Titanium Graphite"
              className={`w-4 h-4 rounded-full bg-slate-600 border ${selectedColorTheme === 'titanium' ? 'ring-2 ring-slate-500 scale-110' : 'opacity-80'}`}
            />
            <button
              onClick={() => setSelectedColorTheme('emerald')}
              title="Cryo Emerald"
              className={`w-4 h-4 rounded-full bg-emerald-600 border ${selectedColorTheme === 'emerald' ? 'ring-2 ring-emerald-500 scale-110' : 'opacity-80'}`}
            />
            <button
              onClick={() => setSelectedColorTheme('amber')}
              title="Hazard Amber"
              className={`w-4 h-4 rounded-full bg-amber-600 border ${selectedColorTheme === 'amber' ? 'ring-2 ring-amber-500 scale-110' : 'opacity-80'}`}
            />
          </div>
        </div>

        {/* Physical LED Status Panel Overlay */}
        <div className={`absolute top-3 right-3 backdrop-blur-md border rounded-lg p-2.5 shadow-md ${
          isDarkMode ? 'bg-slate-900/90 border-slate-800 text-slate-100' : 'bg-white/90 border-slate-200 text-slate-800'
        }`}>
          <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-1.5 flex items-center justify-between">
            <span>IoT Gateway LEDs</span>
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span>
          </div>
          <div className="grid grid-cols-4 gap-2 text-[9px] font-mono text-center">
            <div className="flex flex-col items-center">
              <div className="w-3 h-3 rounded-full led-pwr mb-0.5"></div>
              <span className="text-emerald-400 font-bold">PWR</span>
            </div>
            <div className="flex flex-col items-center">
              <div className="w-3 h-3 rounded-full led-status mb-0.5"></div>
              <span className="text-blue-400 font-bold">STATUS</span>
            </div>
            <div className="flex flex-col items-center">
              <div className="w-3 h-3 rounded-full led-txrx mb-0.5"></div>
              <span className="text-amber-400 font-bold">TX/RX</span>
            </div>
            <div className="flex flex-col items-center">
              <div className={`w-3 h-3 rounded-full mb-0.5 ${isTampered || (simulatedTemp !== null && simulatedTemp > (shipment?.maxSafeTemp ?? 6)) ? 'led-error' : 'led-off'}`}></div>
              <span className={isTampered || (simulatedTemp !== null && simulatedTemp > (shipment?.maxSafeTemp ?? 6)) ? 'text-red-400 font-bold animate-pulse' : 'text-slate-500'}>ERROR</span>
            </div>
          </div>
        </div>

        {/* Rotate & Zoom instructions badge */}
        <div className={`absolute bottom-3 left-3 text-[11px] backdrop-blur px-2.5 py-1 rounded border flex items-center gap-1.5 shadow-xs ${
          isDarkMode ? 'bg-slate-900/80 border-slate-800 text-slate-400' : 'bg-white/80 border-slate-200 text-slate-600'
        }`}>
          <Eye className="w-3.5 h-3.5 text-blue-400" /> Scroll or Drag to Orbit & Zoom
        </div>
      </div>

      {/* Interactive Controls Bar */}
      <div className="mt-3 grid grid-cols-3 gap-2 text-xs">
        <button
          onClick={handleBreachClick}
          className={`px-3 py-2 rounded-lg font-semibold transition flex items-center justify-center gap-1.5 border ${
            isDarkMode
              ? 'bg-red-950/60 hover:bg-red-900/60 text-red-400 border-red-900'
              : 'bg-red-50 hover:bg-red-100 text-red-700 border-red-300'
          }`}
        >
          <Flame className="w-3.5 h-3.5 text-red-500" />
          Simulate Temp Breach
        </button>

        <button
          onClick={() => setAutoRotate(!autoRotate)}
          className={`px-3 py-2 rounded-lg font-semibold transition flex items-center justify-center gap-1.5 border ${
            autoRotate
              ? isDarkMode ? 'bg-blue-950/60 text-blue-400 border-blue-900' : 'bg-blue-50 text-blue-700 border-blue-300'
              : isDarkMode ? 'bg-slate-800 hover:bg-slate-700 text-slate-300 border-slate-700' : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-300'
          }`}
        >
          <RotateCcw className="w-3.5 h-3.5" />
          {autoRotate ? 'Pause Orbit' : 'Enable Orbit'}
        </button>

        <button
          onClick={handleReset}
          className={`px-3 py-2 rounded-lg font-semibold transition flex items-center justify-center gap-1.5 border ${
            isDarkMode
              ? 'bg-slate-800 hover:bg-slate-700 text-slate-300 border-slate-700'
              : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-300'
          }`}
        >
          <RotateCcw className="w-3.5 h-3.5 text-slate-400" />
          Reset View & State
        </button>
      </div>
    </div>
  );
}
