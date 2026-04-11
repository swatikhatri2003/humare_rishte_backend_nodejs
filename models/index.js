const sequelize = require('../config/db');
const State = require('./State');
const City = require('./City');
const Community = require('./Community');
const User = require('./User');
const Kutumb = require('./Kutumb');
const Member = require('./Member');
const MemberDetail = require('./MemberDetail');
const Settings = require('./Settings');

State.hasMany(City, { foreignKey: 'state_id', as: 'cities' });
City.belongsTo(State, { foreignKey: 'state_id', as: 'state' });

Community.hasMany(Kutumb, { foreignKey: 'community_id', as: 'kutumbs' });
Kutumb.belongsTo(Community, { foreignKey: 'community_id', as: 'community' });

User.hasMany(Kutumb, { foreignKey: 'user_id', as: 'kutumbs' });
Kutumb.belongsTo(User, { foreignKey: 'user_id', as: 'owner' });

State.hasMany(Kutumb, { foreignKey: 'state_id', as: 'kutumbs' });
City.hasMany(Kutumb, { foreignKey: 'city_id', as: 'kutumbs' });
Kutumb.belongsTo(State, { foreignKey: 'state_id', as: 'state' });
Kutumb.belongsTo(City, { foreignKey: 'city_id', as: 'city' });

Kutumb.hasMany(Member, { foreignKey: 'kutumb_id', as: 'members' });
Member.belongsTo(Kutumb, { foreignKey: 'kutumb_id', as: 'kutumb' });
Member.belongsTo(Kutumb, { foreignKey: 'spouse_kutumb_id', as: 'spouseKutumb' });

Member.belongsTo(State, { foreignKey: 'state_id', as: 'state' });
Member.belongsTo(City, { foreignKey: 'city_id', as: 'city' });
Member.belongsTo(User, { foreignKey: 'user_id', as: 'user' });
User.hasMany(Member, { foreignKey: 'user_id', as: 'members' });

Member.hasOne(MemberDetail, { foreignKey: 'member_id', as: 'detail' });
MemberDetail.belongsTo(Member, { foreignKey: 'member_id', as: 'member' });

module.exports = {
  sequelize,
  State,
  City,
  Community,
  User,
  Kutumb,
  Member,
  MemberDetail,
  Settings,
};
