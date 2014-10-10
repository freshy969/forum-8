var Post = rootRequire('app/models/Post');
var User = rootRequire('app/models/User');

var models = {Post: Post, User: User};

Post.associate(models);
User.associate(models);

var PostsController = {
  edit: function(data){
    Post.update({
      body: data.body
    },{
      id: data.id
    });
  },
  add: function(data){
    Post.create(data);
  },

  destroy: function(data){
    Post.destroy({
      id: data.id
    });
  },

  index: function(){
    return Post.findAll({
      include: [User],
      order: 'created_at ASC'
    });
  }
};

module.exports = PostsController;
