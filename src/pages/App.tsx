import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router";
import { useEffect } from "react";

function App() {
  const navigate = useNavigate();

  useEffect(() => {
    if (!localStorage.getItem("token")) {
      navigate("/");
    }
  }, [navigate]);

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Home Screen</h1>
      <Button onClick={() => navigate("/login")}>Go to Login</Button>
    </div>
  );
}
export default App;
