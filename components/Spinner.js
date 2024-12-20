import {HashLoader} from "react-spinners";

export default function Spinner({fullWidth}) {
  if (fullWidth) {
    return (
      <div className="w-full flex justify-center">
        <HashLoader color={'#b82152'} speedMultiplier={2} />
      </div>
    );
  }
  return (
    <HashLoader color={'#b82152'} speedMultiplier={2} />
  );
}