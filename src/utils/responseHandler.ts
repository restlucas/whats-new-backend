import { Response } from "express";

const responseHandler = {
  success(res: Response, message: string, data?: any) {
    res.status(200).json({ success: true, message, data });
  },

  created(res: Response, message: string, data?: any) {
    res.status(201).json({ success: true, message, data });
  },

  updated(res: Response, message: string, data?: any) {
    res.status(200).json({ success: true, message, data });
  },

  deleted(res: Response, message: string) {
    res.status(200).json({ success: true, message });
  },

  error(res: Response, status: number, message: string) {
    res.status(status).json({ success: false, message });
  },
};

export default responseHandler;
