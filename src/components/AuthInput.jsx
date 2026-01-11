export default function AuthInput({ label, ...props }) {
  return (
    <label className="block">
      <span className="text-sm text-white/70">{label}</span>
      <input
        {...props}
        className="mt-2 w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none placeholder:text-white/35 focus:border-emerald-400/40 focus:ring-4 focus:ring-emerald-500/10 transition"
      />
    </label>
  );
}
