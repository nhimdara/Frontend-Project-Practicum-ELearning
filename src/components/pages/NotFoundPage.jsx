import React from "react";
import { ArrowLeft, Home } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { Button, Card } from "../ui";

const NotFoundPage = ({ isAuthenticated }) => {
  const navigate = useNavigate();
  return (
    <main className="grid min-h-screen place-items-center bg-slate-50 px-5 py-16">
      <Card className="w-full max-w-xl p-8 text-center sm:p-12">
        <p className="ui-eyebrow">Error 404</p>
        <h1 className="text-4xl font-bold tracking-tight text-slate-950">This page doesn’t exist</h1>
        <p className="mx-auto mt-3 max-w-md text-slate-600">The link may be outdated, or the page may have moved.</p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Button variant="secondary" onClick={() => navigate(-1)}><ArrowLeft className="h-4 w-4" /> Go back</Button>
          <Button as={Link} to={isAuthenticated ? "/home" : "/login"}><Home className="h-4 w-4" /> {isAuthenticated ? "Go home" : "Sign in"}</Button>
        </div>
      </Card>
    </main>
  );
};

export default NotFoundPage;
