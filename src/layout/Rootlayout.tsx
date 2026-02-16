import { Outlet } from "react-router";

function RootLayout() {
  return (
    <div>
      <div className="bg-sky-300">Navigation</div>
      <Outlet />
      <div className="bg-sky-300">Footer Menu</div>
    </div>
  );
}

export default RootLayout;
