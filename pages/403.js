import Link from "next/link";

export default function ForbiddenPage() {
  return (
    <div style={{ textAlign: "center", marginTop: "50px" }}>
      <h1>403 - Forbidden</h1>
      <p>You do not have access to this page.</p>
      <Link href="https://www.boxtelsupermarket.nl/">Go back to Home</Link>
    </div>
  );
}
