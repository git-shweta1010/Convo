// src/pages/FriendsPage.jsx
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router";
import {
  getUserFriends,
  getFriendRequests,
  acceptFriendRequest,
} from "../lib/api.js";
import { HiUserPlus } from "react-icons/hi2";

const FriendsPage = () => {
  const [search, setSearch] = useState("");
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  // Fetch current friends
  const { data: rawFriends, isLoading: loadingFriends } = useQuery({
    queryKey: ["friends"],
    queryFn: getUserFriends,
    staleTime: 300000, // 5 minutes
  });

  // Fetch incoming friend requests
  const { data: requestsData, isLoading: loadingRequests } = useQuery({
    queryKey: ["friendRequests"],
    queryFn: getFriendRequests,
    staleTime: 300000,
  });

  // Mutation: accept a friend request
  const acceptMutation = useMutation({
    mutationFn: acceptFriendRequest,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["friends"] });
      queryClient.invalidateQueries({ queryKey: ["friendRequests"] });
    },
  });

  if (loadingFriends || loadingRequests) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center h-64">
          <span className="loading loading-spinner loading-lg"></span>
        </div>
      </div>
    );
  }

  // Handle API response - your /users/friends returns an array directly
  const friends = Array.isArray(rawFriends) ? rawFriends : rawFriends?.friends ?? [];
  const requests = Array.isArray(requestsData) ? requestsData : requestsData?.requests ?? [];

  const filteredFriends = friends.filter((f) =>
    f.fullName?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="p-6 space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-semibold">Friends</h1>
        {requests.length > 0 && (
          <div className="badge badge-primary">{requests.length} requests</div>
        )}
      </div>

      {/* Friend Requests */}
      {requests.length > 0 && (
        <section className="bg-base-200 p-4 rounded-lg">
          <h2 className="text-xl font-medium mb-4">Friend Requests</h2>
          <ul className="space-y-3">
            {requests.map((req) => (
              <li
                key={req._id}
                className="flex items-center justify-between p-3 bg-base-100 rounded-lg"
              >
                <div className="flex items-center gap-3">
                  <img
                    src={req.profilePic || "/default-avatar.png"}
                    alt={req.fullName}
                    className="h-10 w-10 rounded-full object-cover"
                  />
                  <div>
                    <p className="font-medium">{req.fullName}</p>
                    <p className="text-sm text-gray-500">{req.email}</p>
                  </div>
                </div>
                <button
                  onClick={() => acceptMutation.mutate(req._id)}
                  className="btn btn-sm btn-primary flex items-center gap-1"
                  disabled={acceptMutation.isLoading}
                >
                  <HiUserPlus className="w-4 h-4" /> 
                  {acceptMutation.isLoading ? "..." : "Accept"}
                </button>
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* Search */}
      <div className="form-control">
        <input
          type="text"
          placeholder="Search friends..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="input input-bordered w-full"
          
        />
        {console.log(search)}
      </div>

      {/* Friends List */}
      <section>
        <h2 className="text-xl font-medium mb-4">
          Your Friends ({friends.length})
        </h2>
        {filteredFriends.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-500 mb-2">
              {friends.length === 0 ? "No friends yet." : "No friends match your search."}
            </p>
            {friends.length === 0 && (
              <p className="text-sm text-gray-400">
                Send friend requests from the Home page to get started!
              </p>
            )}
          </div>
        ) : (
          <ul className="space-y-4">
            {filteredFriends.map((friend) => (
              <li
                key={friend._id}
                className="flex items-center justify-between bg-base-200 p-4 rounded-lg hover:bg-base-300 transition-colors"
              >
                <div className="flex items-center gap-4">
                  <img
                    src={friend.profilePic || "/default-avatar.png"}
                    alt={friend.fullName}
                    className="h-12 w-12 rounded-full object-cover"
                  />
                  <div>
                    <p className="font-medium">{friend.fullName}</p>
                    <p className="text-sm text-gray-500">{friend.email}</p>
                    {friend.nativeLanguage && friend.learningLanguage && (
                      <div className="flex gap-2 mt-1">
                        <span className="badge badge-primary badge-sm">
                          Native: {friend.nativeLanguage}
                        </span>
                        <span className="badge badge-secondary badge-sm">
                          Learning: {friend.learningLanguage}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => navigate(`/chat/${friend._id}`)}
                    className="btn btn-sm btn-outline"
                  >
                    Message
                  </button>
                  <button
                    onClick={() => navigate(`/call/${friend._id}`)}
                    className="btn btn-sm btn-primary"
                  >
                    Call
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
};

export default FriendsPage;
