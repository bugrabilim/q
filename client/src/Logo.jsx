// Queer Quest Quench — Logo bileşeni (V3 yatay: madalyon "q" + isim + gökkuşağı)
// Marka rengi: ahşap/parşömen (sıcak piksel-art tema ile uyumlu, sabit).
// Açılış ekranında ve ileride başka yerlerde yeniden kullanılır.

export default function Logo({ yukseklik = 116 }) {
  return (
    <svg
      className="qlogo"
      viewBox="0 0 360 124"
      height={yukseklik}
      role="img"
      aria-label="Queer Quest Quench"
    >
      {/* Madalyon "q" (sol) */}
      <circle cx="60" cy="62" r="48" fill="#9a6532" stroke="#5c3a17" strokeWidth="5" />
      <circle cx="60" cy="62" r="38" fill="#fbf3dd" stroke="#cda972" strokeWidth="2.5" />
      <text x="60" y="87" fontFamily="Lora, serif" fontSize="54" fontWeight="700"
        fill="#5c3a17" textAnchor="middle" fontStyle="italic">q</text>

      {/* İsim (sağ, iki satır) */}
      <text x="122" y="52" fontFamily="Lora, serif" fontSize="32" fontWeight="700" fill="#3d2b1c">Queer Quest</text>
      <text x="122" y="88" fontFamily="Lora, serif" fontSize="32" fontWeight="700" fill="#3d2b1c">Quench</text>

      {/* Gökkuşağı şerit (isim altı) */}
      <g>
        <rect x="123" y="100" width="26" height="6" rx="1" fill="#e05a5a" />
        <rect x="151" y="100" width="26" height="6" rx="1" fill="#e8932e" />
        <rect x="179" y="100" width="26" height="6" rx="1" fill="#e8c54e" />
        <rect x="207" y="100" width="26" height="6" rx="1" fill="#5aa872" />
        <rect x="235" y="100" width="26" height="6" rx="1" fill="#5a8bb0" />
        <rect x="263" y="100" width="26" height="6" rx="1" fill="#8a6bb0" />
      </g>
    </svg>
  );
}
