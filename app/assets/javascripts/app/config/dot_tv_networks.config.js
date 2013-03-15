shelby.config.dotTvNetworks = {
  dotTvCuratorSpecialConfig : [
    {
      id : '513f4963b415cc143a00ec85', // chipsahoy
      bodyClass : 'shelby--chips-ahoy',
      buttonColor : 'button_chips-ahoy',
      customShareMessages : {
        email : 'Check this sweet video I found on ChipsAhoy.TV via Shelby.tv: <%= link %>',
        facebook : 'Do you have the #sweetestbracket? Check this sweet video I found on ChipsAhoy.TV via @Shelby',
        twitter : 'Do you have the #sweetestbracket? Check this sweet video I found on @ChipsAhoy TV <%= link %> via @Shelby'
      },
      showAppBanner : true,
      showDotTvNetworkBanner : false,
      socialLinks : {
        facebook : 'http://facebook.com/chipsahoy',
        twitter : 'http://twitter.com/chipsahoy'
      }
    }
  ],
  dotTvRollSpecialConfig : [
    {
      id : '513f4964b415cc143a00ec8b', // chipsahoy.tv aka March Madness
      attribution : {
        authorAvatar : '//s3.amazonaws.com/shelby-gt-user-avatars/sq48x48/513f4963b415cc143a00ec85?1363269645000',
        authorName : 'Chips Ahoy!'
      },
      showAttribution : true,
      rollTitleOverride : 'The Sweetest Bracket'
    },
    {
      id : '513f8019b415cc3b3900000d', // #sweetestbracket
      attribution : {
        authorAvatar : '//s3.amazonaws.com/shelby-gt-user-avatars/sq48x48/51420e57b415cc7c7c064a1d?1363283581000',
        authorName : 'The videoverse'
      },
      showAttribution : true
    },
    {
      id : '50f6d51cb415cc7ebd000007', // #MarchMadness
      attribution : {
        authorAvatar : '//s3.amazonaws.com/shelby-gt-user-avatars/sq48x48/51420e57b415cc7c7c064a1d?1363283581000',
        authorName : 'The videoverse'
      },
      showAttribution : true
    }
  ]
};