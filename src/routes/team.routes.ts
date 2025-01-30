import { Router } from "express";

import authMiddleware from "../middlewares/authMiddleware";
import {
  create,
  getAllTeamsByUser,
  getLastNewsAndTopUsers,
  getMemberInvitations,
  getMembersByTeam,
  getStatistics,
  getTeamInvitations,
  handleTeamInvite,
  makeInvitation,
  removeMember,
  revokeInvitation,
  updateMemberRole,
  validateInvitation,
} from "../controllers/teamsController";

const router = Router();

router.get("/statistics", authMiddleware, getStatistics);
router.get("/news/members", authMiddleware, getLastNewsAndTopUsers);
router.get("/all", authMiddleware, getAllTeamsByUser);
router.get("/members", getMembersByTeam);
router.get("/invitations", authMiddleware, getTeamInvitations);
router.get("/invitations/members", authMiddleware, getMemberInvitations);
router.get("/invitations/validate", validateInvitation);
router.post("/", authMiddleware, create);
router.post("/invitations", authMiddleware, makeInvitation);
router.put("/invitation/team", authMiddleware, handleTeamInvite);
router.put("/member/role", authMiddleware, updateMemberRole);
router.delete("/member", removeMember);
router.delete("/invitations", authMiddleware, revokeInvitation);

export default router;
