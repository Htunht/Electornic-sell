import { useRouteError } from "react-router";

function Error() {
  const error: any = useRouteError();
  console.error("Route Error:", error);

  return (
    <div className="h-screen flex flex-col items-center justify-center bg-slate-50 text-slate-900 p-4 font-sans">
      <div className="max-w-md w-full bg-white p-8 rounded-3xl shadow-xl border border-slate-200">
        <h1 className="text-4xl font-bold text-emerald-600 mb-2">Oops!</h1>
        <h2 className="text-xl font-semibold mb-4 text-slate-800">Something went wrong</h2>
        <div className="bg-slate-100 p-4 rounded-xl mb-6 overflow-auto max-h-40">
          <p className="text-sm font-mono text-slate-600">
            {error?.statusText || error?.message || "Unknown Error"}
          </p>
        </div>
        <button 
          onClick={() => window.location.href = "/"}
          className="w-full py-3 bg-emerald-600 text-white rounded-xl font-bold hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-200"
        >
          Go Back Home
        </button>
      </div>
    </div>
  );
}
export default Error;
