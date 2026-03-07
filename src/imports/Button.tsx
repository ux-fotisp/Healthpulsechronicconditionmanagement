import svgPaths from "./svg-tfmsmtvnjx";

export default function Button() {
  return (
    <div className="bg-[#4a4d4c] border-[0.833px] border-[rgba(142,175,157,0.4)] border-solid relative rounded-[17.5px] size-full" data-name="button">
      <div className="absolute left-[281.91px] size-[13.997px] top-[20.16px]" data-name="Activity">
        <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 13.9974 13.9974">
          <g clipPath="url(#clip0_37_3971)" id="Activity">
            <rect fill="#F6F7F6" height="13.9974" width="13.9974" />
            <path d={svgPaths.pf109580} id="Vector" stroke="var(--stroke-0, #111820)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.16645" />
          </g>
          <defs>
            <clipPath id="clip0_37_3971">
              <rect fill="white" height="13.9974" width="13.9974" />
            </clipPath>
          </defs>
        </svg>
      </div>
      <p className="-translate-x-1/2 absolute font-['Montserrat:Bold',sans-serif] font-bold leading-[19.5px] left-[339.91px] text-[#f6f7f6] text-[13px] text-center top-[18.08px] tracking-[0.26px] whitespace-nowrap">Log Vitals</p>
    </div>
  );
}