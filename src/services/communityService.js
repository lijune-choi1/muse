// src/services/communityService.js
// This service provides functions for managing communities

import critiqueService from './CritiqueService';

// Create a new community
export const createCommunity = async (communityData) => {
  try {
    // Use the existing critiqueService to create the community
    const createdCommunity = await critiqueService.createCommunity(communityData);
    return createdCommunity;
  } catch (error) {
    console.error('Error in communityService.createCommunity:', error);
    throw error;
  }
};

// Get community by name
export const getCommunityByName = async (name) => {
  try {
    const community = await critiqueService.getCommunityByName(name);
    return community;
  } catch (error) {
    console.error('Error in communityService.getCommunityByName:', error);
    throw error;
  }
};

// Get all communities
export const getAllCommunities = async () => {
  try {
    const communities = await critiqueService.getAllCommunities();
    return communities;
  } catch (error) {
    console.error('Error in communityService.getAllCommunities:', error);
    throw error;
  }
};

// Get communities created by a user
export const getUserCreatedCommunities = async (username) => {
  try {
    const communities = await critiqueService.getUserCreatedCommunities(username);
    return communities;
  } catch (error) {
    console.error('Error in communityService.getUserCreatedCommunities:', error);
    throw error;
  }
};

// Get communities a user follows
export const getUserFollowedCommunities = async (username) => {
  try {
    const communities = await critiqueService.getUserFollowedCommunities(username);
    return communities;
  } catch (error) {
    console.error('Error in communityService.getUserFollowedCommunities:', error);
    throw error;
  }
};

// Follow a community
export const followCommunity = async (username, communityId) => {
  try {
    const result = await critiqueService.followCommunity(username, communityId);
    return result;
  } catch (error) {
    console.error('Error in communityService.followCommunity:', error);
    throw error;
  }
};

// Unfollow a community
export const unfollowCommunity = async (username, communityId) => {
  try {
    const result = await critiqueService.unfollowCommunity(username, communityId);
    return result;
  } catch (error) {
    console.error('Error in communityService.unfollowCommunity:', error);
    throw error;
  }
};

// Check if a user is following a community
export const isUserFollowingCommunity = async (username, communityId) => {
  try {
    const result = await critiqueService.isUserFollowingCommunity(username, communityId);
    return result;
  } catch (error) {
    console.error('Error in communityService.isUserFollowingCommunity:', error);
    throw error;
  }
};

export default {
  createCommunity,
  getCommunityByName,
  getAllCommunities,
  getUserCreatedCommunities,
  getUserFollowedCommunities,
  followCommunity,
  unfollowCommunity,
  isUserFollowingCommunity
};