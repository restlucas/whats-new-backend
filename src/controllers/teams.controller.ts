import jwt, { JwtPayload } from "jsonwebtoken";
import { Request, Response } from "express";
import teamsService from "../services/teams.service";
import responseHandler from "../utils/responseHandler";

export const create = async (req: Request, res: Response) => {
  const { userId, teamName } = req.body;

  try {
    const team = await teamsService.createTeam(userId, teamName);
    responseHandler.created(res, "Team created successfully", team);
  } catch (error: unknown) {
    responseHandler.error(
      res,
      400,
      error instanceof Error ? error.message : "An error occurred"
    );
  }
};

export const getAllTeamsByUser = async (req: Request, res: Response) => {
  const { userId } = req.params;

  try {
    const teams = await teamsService.getAllByUser(userId as string);
    responseHandler.success(res, "Teams fetched successfully", teams);
  } catch (error: unknown) {
    responseHandler.error(
      res,
      400,
      error instanceof Error ? error.message : "An error occurred"
    );
  }
};

export const getMembersByTeam = async (req: Request, res: Response) => {
  const { teamId } = req.params;

  try {
    const members = await teamsService.getMembers(teamId as string);
    responseHandler.success(res, "Members fetched successfully", members);
  } catch (error: unknown) {
    responseHandler.error(
      res,
      400,
      error instanceof Error ? error.message : "An error occurred"
    );
  }
};

export const updateMemberRole = async (req: Request, res: Response) => {
  try {
    const { teamId } = req.params;
    const { userId, roleValue } = req.body;

    const updatedRole = await teamsService.updateRole(
      teamId as string,
      userId as string,
      roleValue as string
    );
    responseHandler.updated(
      res,
      "Member role updated successfully",
      updatedRole
    );
  } catch (error: unknown) {
    responseHandler.error(
      res,
      400,
      error instanceof Error ? error.message : "An error occurred"
    );
  }
};

export const getMemberInvitations = async (req: Request, res: Response) => {
  try {
    const { teamId } = req.params;

    const invitations = await teamsService.getInvitationsByTeam(
      teamId as string
    );
    responseHandler.success(
      res,
      "Member invitations fetched successfully",
      invitations
    );
  } catch (error: unknown) {
    responseHandler.error(
      res,
      500,
      error instanceof Error ? error.message : "An unexpected error occurred"
    );
  }
};

export const getTeamInvitations = async (req: Request, res: Response) => {
  try {
    const { userEmail } = req.query;

    const invitations = await teamsService.getInvitationsByUser(
      userEmail as string
    );
    responseHandler.success(
      res,
      "Team invitations fetched successfully",
      invitations
    );
  } catch (error: unknown) {
    responseHandler.error(
      res,
      500,
      error instanceof Error ? error.message : "An unexpected error occurred"
    );
  }
};

export const makeInvitation = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { teamId } = req.params;
  const { userEmail } = req.body;

  try {
    const response = await teamsService.createInvite(
      teamId as string,
      userEmail as string
    );

    if ("error" in response) {
      responseHandler.error(res, 200, response.error);
      return;
    }

    responseHandler.created(res, "Invitation sent successfully", response);
  } catch (error: unknown) {
    responseHandler.error(
      res,
      500,
      error instanceof Error ? error.message : "An unexpected error occurred"
    );
  }
};

export const revokeInvitation = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { inviteId } = req.params;

  try {
    const response = await teamsService.deleteInvite(inviteId as string);
    responseHandler.success(res, "Invitation revoked successfully", response);
  } catch (error: unknown) {
    responseHandler.error(
      res,
      500,
      error instanceof Error ? error.message : "An unexpected error occurred"
    );
  }
};

export const validateInvitation = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { token } = req.query;

  try {
    const { invitationId, email } = jwt.verify(
      token as string,
      process.env.JWT_SECRET as string
    ) as JwtPayload & { invitationId: string; email: string };

    let redirect = `/auth/creator?method=register&email=${email}`;
    let message = `Token is valid, redirecting to register page!`;

    const userInSystem = await teamsService.getInvitationsByUser(
      email as string
    );
    if (userInSystem) {
      redirect = "/auth/creator?method=login";
      message = "Make login and access system to accept invite!";
    }

    responseHandler.success(res, message, { redirect });
  } catch (error: unknown) {
    responseHandler.error(
      res,
      400,
      error instanceof Error ? error.message : "An error occurred"
    );
  }
};

export const removeMember = async (req: Request, res: Response) => {
  const { teamId } = req.params;
  const { memberId } = req.body;

  try {
    const response = await teamsService.removeUser(
      teamId as string,
      memberId as string
    );
    responseHandler.success(res, "Member removed successfully", response);
  } catch (error: unknown) {
    responseHandler.error(
      res,
      500,
      error instanceof Error ? error.message : "An unexpected error occurred"
    );
  }
};

export const getStatistics = async (req: Request, res: Response) => {
  const { teamId } = req.params;
  const { type } = req.query;

  let key = null;
  switch (type) {
    case "recentViews":
      key = "views";
      break;

    case "likeRate":
      key = "likes";
      break;

    default:
      break;
  }

  try {
    const response = await teamsService.getStatisticsByTeam(
      teamId as string,
      key as string
    );
    responseHandler.success(res, "Statistics fetched successfully", {
      data: response,
    });
  } catch (error: unknown) {
    responseHandler.error(
      res,
      500,
      error instanceof Error ? error.message : "An unexpected error occurred"
    );
  }
};

export const getLastNewsAndTopUsers = async (req: Request, res: Response) => {
  const { teamId } = req.params;

  try {
    const response = await teamsService.getLastFiveNewsAndTopUsers(
      teamId as string
    );
    responseHandler.success(
      res,
      "Last news and top users fetched successfully",
      { data: response }
    );
  } catch (error: unknown) {
    responseHandler.error(
      res,
      500,
      error instanceof Error ? error.message : "An unexpected error occurred"
    );
  }
};

export const handleTeamInvite = async (req: Request, res: Response) => {
  const { userId } = req.params;
  const { invitationId, action } = req.body;

  try {
    const response = await teamsService.updateTeamInvitation(
      userId,
      invitationId,
      action
    );
    responseHandler.success(res, "Team invitation handled successfully", {
      message: "Success",
      user: response,
    });
  } catch (error: unknown) {
    responseHandler.error(
      res,
      400,
      error instanceof Error ? error.message : "An error occurred"
    );
  }
};
