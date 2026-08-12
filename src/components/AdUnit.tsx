import React from 'react';

interface AdUnitProps {
  adKey: string;
  width: number;
  height: number;
  className?: string;
  label?: string;
}

export const AdUnit: React.FC<AdUnitProps> = ({
  adKey,
  width,
  height,
  className = '',
  label = 'Iklan',
}) => {
  const htmlContent = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    html, body {
      margin: 0;
      padding: 0;
      width: 100%;
      height: 100%;
      overflow: hidden;
      display: flex;
      justify-content: center;
      align-items: center;
      background-color: transparent;
    }
  </style>
</head>
<body>
  <script type="text/javascript">
    atOptions = {
      'key' : '${adKey}',
      'format' : 'iframe',
      'height' : ${height},
      'width' : ${width},
      'params' : {}
    };
  </script>
  <script type="text/javascript" src="https://www.highperformanceformat.com/${adKey}/invoke.js"></script>
</body>
</html>`;

  return (
    <div className={`flex flex-col items-center justify-center max-w-full overflow-hidden ${className}`}>
      {label && (
        <span className="text-[10px] font-medium uppercase tracking-wider text-slate-500/70 mb-2.5 select-none leading-none">
          {label}
        </span>
      )}
      <iframe
        title={`ad-${adKey}`}
        srcDoc={htmlContent}
        width={width}
        height={height}
        style={{
          border: 'none',
          width: `${width}px`,
          height: `${height}px`,
          maxWidth: '100%',
          overflow: 'hidden',
          backgroundColor: 'transparent',
          display: 'block',
        }}
        scrolling="no"
        frameBorder="0"
      />
    </div>
  );
};
