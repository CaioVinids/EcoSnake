import React, { useEffect } from "react";

const Home = () => {
  useEffect(() => {
    window.location.href = "/index.html";
  }, []);

  return null;
};

export default Home;
