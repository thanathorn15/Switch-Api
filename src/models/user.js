module.exports = (sequelize, DataTypes) => {
  const User = sequelize.define(
    "User",
    {
      username: {
        type: DataTypes.STRING,
        validate: {
          notEmpty: true,
        },
      },
      firstName: {
        type: DataTypes.STRING,
        validate: {
          notEmpty: true,
        },
      },
      lastName: {
        type: DataTypes.STRING,
        validate: {
          notEmpty: true,
        },
      },
      email: {
        type: DataTypes.STRING,
        unique: true,
        allowNull: false,
        validate: {
          isEmail: true,
        },
      },
      password: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      profileImageUrl: DataTypes.STRING,
      isGoogleLogin: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      },
      google_acc_sub: {
        type: DataTypes.UUID,
      },
      google_acc_name: DataTypes.STRING,
    },
    {
      underscored: true,
      paranoid: true,
    }
  );

  User.associate = (models) => {
    User.hasMany(models.Post, {
      foreignKey: {
        name: "userId",
        allowNull: false,
      },
      onDelete: "RESTRICT",
    });

    User.hasMany(models.Reply, {
      foreignKey: {
        name: "userId",
        allowNull: false,
      },
      onDelete: "RESTRICT",
    });

    User.hasMany(models.Like, {
      foreignKey: {
        name: "userId",
        allowNull: false,
      },
      onDelete: "RESTRICT",
    });

    User.hasMany(models.Follow, {
      as: "Following",
      foreignKey: {
        name: "folllowingUserId",
        allowNull: false,
      },
      onDelete: "RESTRICT",
    });

    User.hasMany(models.Follow, {
      as: "Follower",
      foreignKey: {
        name: "followerUserId",
        allowNull: false,
      },
      onDelete: "RESTRICT",
    });

    User.hasMany(models.ReswitchProfile, {
      foreignKey: {
        name: "userId",
        allowNull: false,
      },
      onDelete: "RESTRICT",
    });

    User.hasMany(models.Like, {
      foreignKey: {
        name: "userId",
        allowNull: false,
      },
      onDelete: "RESTRICT",
    });

    User.hasMany(models.Message, {
      as: "Sender",
      foreignKey: {
        name: "senderId",
        allowNull: false,
      },
      onDelete: "RESTRICT",
    });

    User.hasMany(models.Message, {
      as: "Receiver",
      foreignKey: {
        name: "receiverId",
        allowNull: false,
      },
      onDelete: "RESTRICT",
    });

    User.hasMany(models.Chat, {
      as: "UserOne",
      foreignKey: {
        name: "user1Id",
        allowNull: false,
      },
      onDelete: "RESTRICT",
    });

    User.hasMany(models.Chat, {
      as: "UserTwo",
      foreignKey: {
        name: "user2Id",
        allowNull: false,
      },
      onDelete: "RESTRICT",
    });

    User.hasMany(models.Notification, {
      foreignKey: {
        name: "userId",
        allowNull: false,
      },
      onDelete: "RESTRICT",
    });
  };

  return User;
};
