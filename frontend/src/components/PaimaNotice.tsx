import React from "react";
import Card from "./Card";

export const PaimaNotice: React.FC = () => {
  return (
    <Card
      gap={1}
      sx={{
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "8px 16px",
        textTransform: "uppercase",
      }}
    >
      <svg
        width="24"
        height="26"
        viewBox="0 0 24 26"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M9.57596 0.745568C5.11435 0.847515 1.40447 3.69525 0.194799 7.60385C0.0121128 6.85809 -0.145269 4.54357 0.225658 3.88616C1.13847 2.26551 4.30646 -0.120676 8.2916 0.00475C9.24391 0.0337896 11.1152 0.404507 11.3084 0.780168C11.3325 0.826508 10.3641 0.72765 9.57596 0.745568Z"
          fill="white"
        />
        <path
          d="M23.8642 15.6156L23.8488 15.6094C23.8419 15.6051 23.8344 15.602 23.8266 15.6002C23.8177 15.5992 23.8091 15.5974 23.8006 15.5946C23.7906 15.594 23.7805 15.594 23.7704 15.5946C23.7605 15.5946 23.7507 15.5946 23.7389 15.5946H23.7056H23.6704C23.6593 15.5946 23.6463 15.5995 23.634 15.6008C23.6093 15.607 23.5852 15.61 23.5599 15.6181C23.5079 15.6334 23.457 15.6521 23.4075 15.6743C23.3554 15.696 23.3046 15.7209 23.2557 15.7491C23.204 15.7759 23.1537 15.8054 23.1051 15.8374L22.9588 15.935L22.8162 16.0438L22.7446 16.0988L22.6761 16.1569L22.5379 16.2742C22.4465 16.3546 22.3601 16.4398 22.27 16.5214L21.9972 16.7778C21.9059 16.8631 21.8121 16.9428 21.7158 17.0249C21.3351 17.347 20.9291 17.638 20.5018 17.8949C20.2901 18.0247 20.0698 18.142 19.8501 18.2539C19.6286 18.3653 19.4009 18.4637 19.1681 18.5486C19.3937 18.4485 19.6134 18.3354 19.826 18.21C20.0383 18.0864 20.2469 17.9542 20.4475 17.8115C20.8502 17.531 21.2298 17.2186 21.5825 16.8773C21.6695 16.7908 21.7584 16.7074 21.8411 16.6178L22.0923 16.3484C22.1781 16.2576 22.2614 16.163 22.3503 16.0747L22.486 15.9425L22.5546 15.8763L22.6261 15.8146L22.77 15.691L22.9249 15.573C22.9768 15.5336 23.0308 15.4969 23.0866 15.463C23.1427 15.4257 23.201 15.3919 23.2612 15.3617C23.3533 15.3164 23.4489 15.2786 23.547 15.2486C23.549 15.2478 23.5509 15.2465 23.5523 15.2449C23.5537 15.2432 23.5547 15.2411 23.5552 15.239C23.5556 15.2368 23.5555 15.2346 23.5548 15.2325C23.5541 15.2304 23.5529 15.2285 23.5513 15.227C22.2855 14.045 21.6343 15.3845 19.5051 15.4123C19.2711 15.4154 19.0372 15.402 18.8052 15.3722L18.7694 15.3678C17.3745 15.1825 15.6353 14.4355 14.8318 13.8232C14.4071 13.4976 14.0695 13.2115 13.8239 13.0607C13.7412 13.0016 13.6447 12.9648 13.5437 12.9539C13.118 12.9607 12.693 12.9927 12.2711 13.0496L6.82383 13.028C6.64973 13.0285 6.4776 13.065 6.31828 13.1353C6.15896 13.2056 6.01589 13.3081 5.89806 13.4364C5.805 13.5398 5.695 13.6265 5.5728 13.6928C5.38661 13.7905 5.17874 13.8394 4.96858 13.8349C4.65073 13.8349 4.19093 13.6916 3.80705 13.0107C3.57128 12.5912 3.39477 12.0116 3.29602 11.3332C3.14193 10.2081 3.19233 9.06435 3.44476 7.95719C3.75335 6.67884 4.31993 5.83731 5.07597 5.52652C6.22331 5.05324 7.0275 5.43879 7.80391 5.81074C8.4211 6.10793 9.06235 6.41501 9.99985 6.41501C10.9373 6.41501 11.5774 6.10608 12.1964 5.81074C12.9728 5.44002 13.7758 5.05324 14.9243 5.52652C15.681 5.83545 16.2439 6.67884 16.5555 7.95719C16.8084 9.06431 16.8586 10.2082 16.7037 11.3332C16.6055 12.0128 16.429 12.5912 16.1926 13.0107C16.0991 13.1816 15.9821 13.3386 15.8452 13.4772C15.8277 13.4932 15.8141 13.513 15.8052 13.535C15.7964 13.557 15.7926 13.5808 15.7941 13.6044C15.7955 13.6281 15.8023 13.6512 15.8138 13.6719C15.8253 13.6927 15.8413 13.7106 15.8606 13.7243C16.3914 14.1055 17.2993 14.5041 18.1318 14.7413C18.317 14.7951 18.5021 14.839 18.678 14.8736L18.6947 14.8779C18.7959 14.897 18.8953 14.9149 18.9885 14.9279L18.9916 14.9224L19.0261 14.9261C19.6472 14.9803 20.2731 14.9302 20.8777 14.7778C20.6604 13.4049 20.0908 12.1871 19.876 11.8466C19.8573 11.8138 19.8345 11.7834 19.8081 11.7564C19.5873 12.0883 19.3064 12.3759 18.9798 12.6041C19.6359 11.6502 20.0593 11.382 19.8513 9.75209C19.6403 7.70384 18.7963 5.77251 17.4369 4.22728C16.0774 2.68205 14.2703 1.5999 12.2674 1.13166L12.2248 1.12178L12.123 1.09892C12.0717 1.08841 12.0211 1.07729 11.9699 1.06741L11.7847 1.03219L11.7557 1.02724C11.6897 1.01551 11.6224 1.00438 11.5551 0.99388C11.5095 0.987084 11.4632 0.979669 11.4169 0.974109C11.3706 0.968548 11.3348 0.962369 11.2935 0.957426L11.17 0.94198C11.0873 0.932712 11.004 0.92468 10.9232 0.916647L10.7997 0.906144C10.5467 0.886372 10.2912 0.876486 10.0332 0.876486C8.5478 0.873388 7.08105 1.20737 5.74315 1.85333C5.63534 1.90523 5.52837 1.95939 5.42221 2.01583C5.35185 2.05351 5.28211 2.09182 5.21175 2.13075L5.12226 2.18203C4.93916 2.28707 4.75915 2.39828 4.58223 2.51568L4.46805 2.59476C4.43164 2.61948 4.39522 2.64419 4.35943 2.67014C4.32363 2.69609 4.28228 2.72451 4.24401 2.75232C3.50521 3.28686 2.84372 3.92101 2.27829 4.6368C2.28261 4.63 2.2857 4.62321 2.29002 4.61641C1.62639 5.4498 1.10179 6.38517 0.73657 7.38629H0.74521C0.742124 7.3937 0.739656 7.40297 0.73657 7.411C0.733484 7.41904 0.718671 7.44251 0.707562 7.46661C0.685063 7.51772 0.666895 7.57063 0.65325 7.62478C0.646461 7.6495 0.640289 7.6773 0.634735 7.70634C-0.173405 10.2015 0.041129 12.9158 1.23119 15.2526C2.42124 17.5895 4.48944 19.3577 6.98121 20.1686C8.31741 18.0982 10.3245 17.028 12.1168 16.2903C10.0048 17.5446 10.1535 18.742 10.809 19.8282C10.4343 19.6033 9.7431 18.5925 9.7431 18.5925C9.7431 18.5925 8.78277 18.9094 7.71504 20.3756C7.70702 20.3867 7.69899 20.3972 7.69159 20.4084C7.41085 20.8012 7.15939 21.2143 6.93924 21.6441C6.62078 24.6951 11.8181 26.2299 11.1077 25.219C10.3973 24.2082 11.6527 20.755 11.6527 20.755C11.6527 20.755 12.2112 21.7701 14.6818 21.7559C17.1524 21.7417 20.1945 20.5746 21.5177 19.6935C22.2558 19.2011 24.582 16.991 23.8642 15.6156ZM17.1283 17.6854C17.0239 17.7416 16.9041 17.7619 16.7871 17.7432C16.6701 17.7246 16.5625 17.668 16.4807 17.5823C16.3989 17.4965 16.3474 17.3862 16.3343 17.2684C16.3211 17.1505 16.3469 17.0316 16.4077 16.9298C16.4685 16.8281 16.561 16.7491 16.671 16.705C16.781 16.661 16.9024 16.6542 17.0165 16.6858C17.1307 16.7175 17.2313 16.7857 17.303 16.8801C17.3747 16.9745 17.4135 17.0899 17.4134 17.2085C17.4139 17.2868 17.3968 17.3643 17.3634 17.4352C17.3144 17.542 17.2318 17.6299 17.1283 17.6854Z"
          fill="white"
        />
        <path
          d="M17.4122 17.209C17.4123 17.3165 17.3806 17.4215 17.321 17.511C17.2614 17.6004 17.1767 17.6701 17.0776 17.7112C16.9784 17.7524 16.8693 17.7632 16.764 17.7423C16.6587 17.7214 16.562 17.6696 16.4861 17.5936C16.4101 17.5176 16.3585 17.4208 16.3376 17.3154C16.3166 17.21 16.3274 17.1007 16.3686 17.0015C16.4097 16.9022 16.4793 16.8174 16.5686 16.7578C16.658 16.6981 16.7629 16.6664 16.8703 16.6665C17.014 16.6665 17.1518 16.7237 17.2534 16.8254C17.3551 16.9271 17.4122 17.0651 17.4122 17.209Z"
          fill="black"
        />
        <path
          d="M12.9284 9.87811C13.1707 9.87811 13.3672 9.68143 13.3672 9.43881C13.3672 9.19619 13.1707 8.99951 12.9284 8.99951C12.686 8.99951 12.4896 9.19619 12.4896 9.43881C12.4896 9.68143 12.686 9.87811 12.9284 9.87811Z"
          fill="white"
        />
        <path
          d="M14.4917 9.87811C14.7341 9.87811 14.9305 9.68143 14.9305 9.43881C14.9305 9.19619 14.7341 8.99951 14.4917 8.99951C14.2493 8.99951 14.0529 9.19619 14.0529 9.43881C14.0529 9.68143 14.2493 9.87811 14.4917 9.87811Z"
          fill="white"
        />
        <path
          d="M13.7097 9.09589C13.952 9.09589 14.1485 8.8992 14.1485 8.65659C14.1485 8.41397 13.952 8.21729 13.7097 8.21729C13.4673 8.21729 13.2709 8.41397 13.2709 8.65659C13.2709 8.8992 13.4673 9.09589 13.7097 9.09589Z"
          fill="white"
        />
        <path
          d="M13.7097 10.6611C13.952 10.6611 14.1485 10.4644 14.1485 10.2218C14.1485 9.97915 13.952 9.78247 13.7097 9.78247C13.4673 9.78247 13.2709 9.97915 13.2709 10.2218C13.2709 10.4644 13.4673 10.6611 13.7097 10.6611Z"
          fill="white"
        />
        <path
          d="M7.04167 8.99999H6.69852V8.65646C6.70073 8.59742 6.69103 8.53855 6.66999 8.48335C6.64895 8.42816 6.617 8.37778 6.57606 8.33523C6.53513 8.29268 6.48604 8.25884 6.43173 8.23572C6.37743 8.2126 6.31902 8.20068 6.26001 8.20068C6.201 8.20068 6.14259 8.2126 6.08829 8.23572C6.03398 8.25884 5.98489 8.29268 5.94396 8.33523C5.90302 8.37778 5.87108 8.42816 5.85004 8.48335C5.82899 8.53855 5.81929 8.59742 5.8215 8.65646V8.99999H5.47835C5.3649 9.00425 5.25751 9.05237 5.17875 9.13423C5.09999 9.21609 5.05599 9.32532 5.05599 9.43898C5.05599 9.55264 5.09999 9.66187 5.17875 9.74373C5.25751 9.82559 5.3649 9.87371 5.47835 9.87797H5.8215V10.2215C5.82576 10.3351 5.87382 10.4426 5.95559 10.5214C6.03736 10.6003 6.14648 10.6443 6.26001 10.6443C6.37354 10.6443 6.48266 10.6003 6.56443 10.5214C6.6462 10.4426 6.69426 10.3351 6.69852 10.2215V9.87797H7.04167C7.10064 9.88019 7.15945 9.87047 7.21458 9.84941C7.26972 9.82834 7.32004 9.79636 7.36254 9.75538C7.40504 9.7144 7.43885 9.66526 7.46195 9.61089C7.48504 9.55653 7.49694 9.49806 7.49694 9.43898C7.49694 9.3799 7.48504 9.32143 7.46195 9.26707C7.43885 9.2127 7.40504 9.16356 7.36254 9.12258C7.32004 9.08159 7.26972 9.04962 7.21458 9.02855C7.15945 9.00749 7.10064 8.99777 7.04167 8.99999Z"
          fill="white"
        />
      </svg>
      <span>Powered by Paima Engine</span>
    </Card>
  );
};
