import React, { forwardRef } from "react";

const Page = forwardRef(({ children }, ref) => {
    return (
        <div ref={ref} className="page">
            {children}
        </div>
    );
});

export default Page;
