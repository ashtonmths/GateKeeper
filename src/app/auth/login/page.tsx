"use client";
import React, { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
    const [form, setForm] = useState({ email: "", password: "" });
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState<string | null>(null);
    const router = useRouter();

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setMessage(null);
        setLoading(true);

        try {
            const result = await signIn("credentials", {
                redirect: false,
                email: form.email,
                password: form.password,
            });

            if (result?.error) {
                setMessage(result.error);
            } else {
                setMessage("Login successful");
                setForm({ email: "", password: "" });
               
                setTimeout(() => {
                    router.push("/");
                }, 1000);
            }
        } catch {
            setMessage("Something went wrong");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex min-h-screen items-center justify-center bg-slate-950 px-4">
            <div className="w-full max-w-md">
                <div className="mb-8 text-center">
                    <h1 className="mb-2 text-5xl font-extrabold text-purple-500">
                        LockSystem
                    </h1>
                    <p className="text-gray-400">Sign in to your account</p>
                </div>

                <div className="rounded-2xl border border-purple-900/50 bg-slate-900 p-8 shadow-2xl">
                    <h2 className="mb-6 text-center text-2xl font-bold text-white">
                        Log In
                    </h2>
                    
                    <form onSubmit={handleSubmit} className="space-y-5">
                        <div>
                            <label className="mb-2 block text-sm font-semibold text-purple-300">
                                Email Address
                            </label>
                            <input
                                type="email"
                                name="email"
                                value={form.email}
                                onChange={handleChange}
                                required
                                placeholder="you@example.com"
                                className="w-full rounded-xl border border-purple-900/50 bg-slate-950 px-4 py-3 text-white placeholder-gray-500 transition focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-500/50"
                            />
                        </div>
                        
                        <div>
                            <label className="mb-2 block text-sm font-semibold text-purple-300">
                                Password
                            </label>
                            <input
                                type="password"
                                name="password"
                                value={form.password}
                                onChange={handleChange}
                                required
                                placeholder="Enter your password"
                                minLength={6}
                                className="w-full rounded-xl border border-purple-900/50 bg-slate-950 px-4 py-3 text-white placeholder-gray-500 transition focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-500/50"
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full rounded-xl bg-purple-600 py-3 font-semibold text-white shadow-lg transition-all hover:bg-purple-700 hover:scale-105 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:scale-100"
                        >
                            {loading ? (
                                <span className="flex items-center justify-center gap-2">
                                    <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                                    Logging in...
                                </span>
                            ) : (
                                "Log In"
                            )}
                        </button>
                    </form>

                    {message && (
                        <div
                            className={`mt-5 rounded-xl px-4 py-3 text-center text-sm font-medium ${
                                message.includes("successful")
                                    ? "bg-green-500/10 text-green-400 ring-1 ring-green-500/50"
                                    : "bg-red-500/10 text-red-400 ring-1 ring-red-500/50"
                            }`}
                        >
                            <div className="flex items-center justify-center gap-2">
                                {message.includes("successful") ? (
                                    <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                    </svg>
                                ) : (
                                    <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                )}
                                {message}
                            </div>
                        </div>
                    )}

                    <div className="mt-6 text-center text-sm text-gray-400">
                        Don&apos;t have an account?{" "}
                        <a href="/auth/signup" className="font-semibold text-purple-400 hover:text-purple-300 hover:underline">
                            Sign up
                        </a>
                    </div>
                </div>
            </div>
        </div>
    );
}