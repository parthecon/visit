

exports.getUserNotifications = async (req, res) => {
  try {
    const userId = req.user._id;
    // The following lines were removed as NotificationLog is no longer imported.
    // const notifications = await NotificationLog.find({ userId })
    //   .sort({ createdAt: -1 })
    //   .limit(50);
    // res.json({ status: 'success', data: notifications });
    // Since NotificationLog is removed, we'll return an empty array or a placeholder.
    res.json({ status: 'success', data: [] });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
}; 