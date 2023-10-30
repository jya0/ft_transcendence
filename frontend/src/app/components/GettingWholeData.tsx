import React from "react";

interface Props {
  profile: any;
}
export const GettingWholeData = ({ profile }: Props) => {
  console.log(profile);
  return <div>GettingWholeData</div>;
};
