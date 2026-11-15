class SafeDrivingPassport {
  final String studentName;
  final String className;
  final String schoolName;
  int safeDrivingScore; // 0 - 100 SDI
  int ecoPoints;
  int consecutiveSafeDays;
  final List<String> earnedBadges;

  SafeDrivingPassport({
    required this.studentName,
    required this.className,
    required this.schoolName,
    this.safeDrivingScore = 95,
    this.ecoPoints = 420,
    this.consecutiveSafeDays = 14,
    List<String>? earnedBadges,
  }) : earnedBadges = earnedBadges ?? ["Tay Lái Vàng Học Đường", "Đại Sứ Mũ Bảo Hiểm"];

  void deductPenaltyForSwerving() {
    safeDrivingScore = (safeDrivingScore - 3).clamp(50, 100);
  }

  void deductPenaltyForHarshBraking() {
    safeDrivingScore = (safeDrivingScore - 2).clamp(50, 100);
  }

  void deductPenaltyForDistraction() {
    safeDrivingScore = (safeDrivingScore - 5).clamp(50, 100);
  }

  void rewardSafeRideCompleted(double distanceKm) {
    int pointsEarned = (distanceKm * 5).round().clamp(5, 30);
    ecoPoints += pointsEarned;
    consecutiveSafeDays += 1;
    if (safeDrivingScore < 98) safeDrivingScore += 1;
  }

  bool canClaimReward(int costPoints) {
    return ecoPoints >= costPoints;
  }

  bool claimReward(int costPoints) {
    if (canClaimReward(costPoints)) {
      ecoPoints -= costPoints;
      return true;
    }
    return false;
  }
}
