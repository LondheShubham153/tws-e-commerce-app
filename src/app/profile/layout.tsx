import ProfileSidebar from "@/components/profile/ProfileSidebar";
import React from "react";

const layout = ({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) => {
  return (
    <div className="profile-page">
      <div className="container">
        <div className="flex gap-7 pt-12 pb-20 flex-col lg:flex-row">
          <div className="left bg-secondary rounded-lg min-w-[270px] lg:h-fit lg:sticky top-0 left-0">
            <ProfileSidebar />
          </div>
          <div className="right flex-1 lg:max-w-[calc(100%-300px)] bg-secondary p-5 rounded-lg">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
};

export default layout;
