import Link from "next/link";

export default function Layout({ children }) {
  const usuario = typeof window !== "undefined"
    ? JSON.parse(localStorage.getItem("usuario"))
    : null;

  return (
    <div style={{ fontFamily: "Arial, sans-serif", padding: "20px" }}>
      <nav style={{ marginBottom: "20px" }}>
        <Link href="/">Home</Link> |{" "}
        {!usuario && <Link href="/login">Login</Link>} |{" "}
        {!usuario && <Link href="/cadastro">Cadastro</Link>} |{" "}
        {usuario && usuario.tipo === "admin" && <Link href="/admin">Admin</Link>} |{" "}
        {usuario && usuario.tipo === "palpiteiro" && <Link href="/palpitar">Palpitar</Link>} |{" "}
        {usuario && (
          <button
            onClick={() => {
              localStorage.removeItem("usuario");
              window.location.href = "/";
            }}
          >
            Logout
          </button>
        )}
      </nav>
      <main>{children}</main>
    </div>
  );
}
