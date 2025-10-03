import { useState, useEffect, useRef } from 'react';


function getWindowDimensions() {
  const { innerWidth: width, innerHeight: height } = window;
  return {
    width,
    height
  };
}

export default function useWindowDimensions() {
  const [windowDimensions, setWindowDimensions] = useState(getWindowDimensions());
  const prevDimensionsRef = useRef(windowDimensions);

  useEffect(() => {
    function handleResize() {
        prevDimensionsRef.current = windowDimensions;
        setWindowDimensions(getWindowDimensions());
    }

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [windowDimensions]);

  return {currentWindowSize:windowDimensions, previousWindowSize:prevDimensionsRef.current};
}
