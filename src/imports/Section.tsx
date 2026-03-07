import svgPaths from "./svg-2c3joiqrot";

export default function Section() {
  return (
    <div className="bg-[rgba(123,154,204,0.1)] content-stretch flex gap-[13.496px] items-center px-[18.828px] py-[0.833px] relative rounded-[18px] size-full" data-name="Section">
      <div aria-hidden="true" className="absolute border-[0.833px] border-[rgba(123,154,204,0.3)] border-solid inset-0 pointer-events-none rounded-[18px]" />
      <div className="bg-[rgba(255,255,255,0.6)] relative rounded-[17.5px] shrink-0 size-[35.996px]" data-name="Container">
        <div aria-hidden="true" className="absolute border-[0.833px] border-[rgba(123,154,204,0.3)] border-solid inset-0 pointer-events-none rounded-[17.5px]" />
        <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex items-center justify-center pl-[0.833px] pr-[0.84px] py-[0.833px] relative size-full">
          <div className="relative shrink-0 size-[13.997px]" data-name="GraduationCap">
            <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 13.9974 13.9974">
              <g clipPath="url(#clip0_37_4019)" id="GraduationCap">
                <path d={svgPaths.p11e00700} id="Vector" stroke="var(--stroke-0, #1E4A8A)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.16645" />
                <path d="M12.8309 5.83225V9.3316" id="Vector_2" stroke="var(--stroke-0, #1E4A8A)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.16645" />
                <path d={svgPaths.p27a568c0} id="Vector_3" stroke="var(--stroke-0, #1E4A8A)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.16645" />
              </g>
              <defs>
                <clipPath id="clip0_37_4019">
                  <rect fill="white" height="13.9974" width="13.9974" />
                </clipPath>
              </defs>
            </svg>
          </div>
        </div>
      </div>
      <div className="flex-[1_0_0] h-[33.991px] min-h-px min-w-px relative" data-name="Container">
        <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex flex-col gap-[1.999px] items-start relative size-full">
          <div className="h-[15.996px] relative shrink-0 w-full" data-name="p">
            <p className="absolute font-['Montserrat:ExtraBold',sans-serif] font-extrabold leading-[16px] left-0 text-[#1e4a8a] text-[10px] top-[-0.33px] tracking-[0.5px] whitespace-nowrap">LEARNING YOUR PATTERNS</p>
          </div>
          <div className="h-[15.996px] opacity-80 relative shrink-0 w-full" data-name="p">
            <p className="absolute font-['Montserrat:Regular',sans-serif] font-normal leading-[16px] left-0 text-[#1e4a8a] text-[10px] top-[-0.33px] whitespace-nowrap">The more readings you log, the better your insights become.</p>
          </div>
        </div>
      </div>
      <div className="relative shrink-0 size-[15.996px]" data-name="Activity">
        <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 15.9961 15.9961">
          <g clipPath="url(#clip0_37_3964)" id="Activity" opacity="0.4">
            <path d={svgPaths.p32e9c00} id="Vector" stroke="var(--stroke-0, #1E4A8A)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.33301" />
          </g>
          <defs>
            <clipPath id="clip0_37_3964">
              <rect fill="white" height="15.9961" width="15.9961" />
            </clipPath>
          </defs>
        </svg>
      </div>
    </div>
  );
}