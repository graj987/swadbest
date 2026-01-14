import { useGLTF } from "@react-three/drei";

export default function JarModel(props) {
  const { scene } = useGLTF("/models/newjar.glb");

  return <primitive object={scene} {...props} />;
}
