declare global {
  var _gwMongo: {
    conn:    import("mongoose").default | null;
    promise: Promise<import("mongoose").default> | null;
  } | undefined;

  var _adminOTP: {
    otp:    string;
    expiry: Date;
  } | undefined;
}

export {};