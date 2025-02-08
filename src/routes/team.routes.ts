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
} from "../controllers/teams.controller";

const router = Router();

router.get("/:teamId/statistics", authMiddleware, getStatistics);
router.get("/:teamId/news/members", authMiddleware, getLastNewsAndTopUsers);
router.get("/:userId/all", authMiddleware, getAllTeamsByUser);
router.get("/:teamId/members", getMembersByTeam);
router.get("/invitations", authMiddleware, getTeamInvitations);
router.get(
  "/:teamId/invitations/members",
  authMiddleware,
  getMemberInvitations
);
router.get("/invitations/validate", validateInvitation);
router.post("/", authMiddleware, create);
router.post("/:teamId/invitations", authMiddleware, makeInvitation);
router.put("/invitation/team/:userId", authMiddleware, handleTeamInvite);
router.put("/:teamId/member/role", authMiddleware, updateMemberRole);
router.delete("/:teamId/member", removeMember);
router.delete("/invitation/:inviteId", authMiddleware, revokeInvitation);

export default router;
