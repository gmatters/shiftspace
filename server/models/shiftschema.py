from datetime import datetime
from couchdb.schema import *
from couchdb.schema import View

from ssdocschema import SSDocument

from server.utils.decorators import *
import server.utils.utils as utils
import schema
import core
from ssuserschema import *

# ==============================================================================
# Errors
# =============================================================================

class ShiftError(Exception): pass
class NoAuthorError(ShiftError): pass
class NoSpaceError(ShiftError): pass
class NoHrefError(ShiftError): pass
class NoContentError(ShiftError): pass

# ==============================================================================
# Utilities
# ==============================================================================

def toDict(kvs):
    result = {}
    for kv in kvs:
        result[kv['key']] = kv['value']
    return result


@simple_decorator
def joindecorator(func):
    def afn(*args, **kwargs):
        return Shift.joinData(func(*args, **kwargs), userId=kwargs.get("userId"))
    return afn

# ==============================================================================
# Shift Model
# ==============================================================================

class Shift(SSDocument):
    """
    The Shift document. A shift is a piece of JSON data used
    by spaces (applications) to recreate a user's modification
    to a page. Refer to the API specification for more detailed
    imformation about the usage of different fields.
    """

    # ========================================
    # Fields
    # ========================================

    type = TextField(default="shift")
    source = DictField(Schema.build(
            server = TextField(),
            database = TextField()
            ))
    createdBy = TextField()
    userName = TextField()
    href = TextField()
    domain = TextField()
    space = DictField(Schema.build(
            name = TextField(),
            version = TextField()
            ))
    summary = TextField()
    created = DateTimeField(default=datetime.now())
    modified = DateTimeField(default=datetime.now())
    broken = BooleanField(default=False)
    commentStream = TextField()
    publishData = DictField(Schema.build(
            draft = BooleanField(default=True),
            private = BooleanField(default=True),
            publishTime = DateTimeField(),
            streams = ListField(DictField(Schema.build(
                        type = TextField(),
                        id = TextField()
                        )))
            ))
    content = DictField()    
            
    # ========================================
    # Views
    # ========================================

    all = View(
        "shifts",
        "function (doc) {            \
           if(doc.type == 'shift') { \
             emit(doc._id, doc);     \
           }                         \
         }")

    by_domain = View(
        "shifts",
        "function (doc) {             \
           if(doc.type == 'shift') {  \
             emit(doc.domain, doc);   \
           }                          \
         }")

    by_href = View(
        "shifts",
        "function(doc) {             \
           if(doc.type == 'shift') { \
             emit(doc.href, doc);    \
           }                         \
         }")

    # ========================================
    # CRUD
    # ========================================

    @classmethod
    def joinData(cls, shifts, userId=None):
        """
        Relatively quick data join function. Makes use
        of multidocument fetch.
        
        Parameters:
          shifts - a single shift or a list of shifts.
          userId - a user id.
        """
        single = False
        if type(shifts) != list:
            single = True
            shifts = [shifts]
        ids = [shift['_id'] for shift in shifts]
        favIds = ["favorite:%s:%s" % (userId, shiftId) for shiftId in ids]

        isFavorited = [(favorite and True) for favorite in core.fetch(keys=favIds)]

        favd = toDict(core.fetch(view=schema.favoritesByShift, keys=ids, reduce=True))
        favCounts = [(favd.get(aid) or 0) for aid in ids]

        ccd = toDict(core.fetch(view=schema.countByShift, keys=ids, reduce=True))
        commentCounts = [(ccd.get(aid) or 0) for aid in ids]

        userIds = [shift['createdBy'] for shift in shifts]
        gravatars = [((user and user.get("gravatar")) or "images/default_user.png")
                     for user in core.fetch(keys=userIds)]

        for i in range(len(shifts)):
            shifts[i]["favorite"] = isFavorited[i]
            shifts[i]["favoriteCount"] = favCounts[i]
            shifts[i]["commentCount"] = commentCounts[i]
            shifts[i]["gravatar"] = gravatars[i]

        if single:
            return shifts[0]
        else:
            return shifts

    @classmethod
    def create(cls, shiftJson, userId):
        """
        Create a shift in the database.
        Parameters:
            shiftJson - the new data for the shift.
        Returns:
            The id of the new shift (string).
        """
        db = core.connect(SSUser.private(userId))
        if not shiftJson.get("createdBy"):
            shiftJson["createdBy"] = userId
        newShift = Shift(**shiftJson)
        newShift.domain = utils.domain(shiftJson["href"])
        newShift.store(db)
        return Shift.joinData(newShift, newShift.createdBy)

    @classmethod
    def read(cls, id, userId=None):
        """
        Get a specific shift. First tries the master database
        then tries the user's private database.
        Parameters:
            id - a shift id.
            userId - a userId. If not supplied tries to read shift from master database.
        Returns:
            a dictionary of the shift's data.
        """
        db = core.connect()
        theShift = Shift.load(db, id)
        if not theShift:
            db = core.connect(SSUser.private(userId))
            theShift = Shift.load(db, id)
        return Shift.joinData(theShift, theShift.createdBy)

    @classmethod
    def update(cls, id, fields, userId):
        """
        Class method for updating a shift.
        
        Parameters:
          id - the id of the shift
          fields - the fields to update. Allowed fields are
            summary, broken, and content.
          userId - a userId.
        """
        db = core.connect(SSUser.private(userId))
        theShift = Shift.load(db, id)
        if newdoc.get("summary"):
            theShift.summary = theShift.content["summary"] = newdoc.get("summary")
        if newdoc.get("broken"):
            theShift.broken = newdoc.get("broken")
        if newdoc.get("content"):
            theShift.content = newdoc.get("content")
        theShift.modified = datetime.now()
        # update the user/private
        theShift.store(db)
        # update user/public if public
        if not theShift.publishData.private:
            public = core.connect(SSUser.public(theShift.createdBy))
            theShift.store(public)
        # update groups & users that shift is published to
        for stream in theShift.streams:
            if stream.type == "user":
                private = core.connect(SSUser.private(streamd.id))
                theShift.store(private)
            elif stream.type == "group":
                Group.update(theShift)
        return Shift.joinData(theShift, newShift.createdBy)

    @classmethod
    def delete(cls, id):
        """
        Delete a shift from the database.
        Parameters:
            id - a shift id.
        """
        db = core.connect()
        del db[id]

    # ========================================
    # Instance Methods
    # ========================================

    def toDict(self):
        """
        Convenience for turning Document into a dictionary.
        """
        dict(self.items())

    # ========================================
    # Validation
    # ========================================

    @classmethod
    def canRead(cls, id, userId):
        """
        Check if a user can read a shift. The user must have
        either:
            1. Created the shift
            2. The shift must be published and public
            3. If the user is subscribed to a stream the shift is on.
            4. If the shift is published to the user's private stream.
        Parameters:
            id - a shift id.
        Returns:
            bool.
        """
        db = core.connect(User.private(userId))
        theShift = Shift.load(db, id)
        if SSUser.isAdmin(userId):
            return True
        if theShift.createdBy == userId:
            return True
        if theShift.publishData.draft:
            return False
        if not theShift.publishData.private:
            return True
        theUser = SSUser.load(core.connect(), userId)
        if theUser.privateStream in theShift.publishData.streams:
            return True
        shiftStreams = theShift.publishData.streams
        readableStreams = Permission.readableStreams(userId)
        allowed = set(shiftStreams).intersection(readableStreams)
        return len(allowed) > 0
    
    @classmethod
    def canUpdate(id, userId):
        """
        Check where a user can update a shift.
        Parameters:
            id - a shift id.
            userId - a user id.
        Returns:
            bool.
        """
        db = core.connect(User.private(userId))
        theShift = Shift.load(id, db)
        return (userId == theShift.createdBy) or User.isAdmin(userId)
    
    @classmethod
    def canDelete(cls, id, userId):
        """
        Check where a user can update a shift.
        Parameters:
            id - a shift id.
            userId - a user id.
        Returns:
            bool.
        """
        db = core.connect(User.private(userId))
        theShift = Shift.load(db, id)
        return SSUser.isAdmin(userId) or (userId == theShift.createdBy)
                          
    @classmethod
    def canPublish(cls, id, userId):
        """
        Check where a user can unpublish a shift.
        Parameters:
            id - a shift id.
            userId - a user id.
        Returns:
            bool.
        """
        db = core.connect(User.private(userId))
        theShift = Shift.load(db, id)
        return (userId == theShift.createdBy) or User.isAdmin(userId)

    @classmethod
    def canUnpublish(cls, id, userId):
        """
        Check where a user can unpublish a shift.
        Parameters:
            id - a shift id.
            userId - a user id.
        Returns:
            bool.
        """
        db = core.connect(User.private(userId))
        theShift = Shift.load(db, id)
        return (userId == theShift.createdBy) or User.isAdmin(userId)

    @classmethod
    def canComment(cls, id, userId):
        """
        Check if the user can comment on a shift. Allowed if:
            1. Shift is public.
            2. If the shift was published to a stream that the user has permissions on.
        """
        db = core.connect(User.private(userId))
        theShift = Shift.load(db, id)
        if not theShift.publishData.private:
          return True
        # ignore private streams
        shiftStreams = [astream for astream in theShift.publishData.streams
                        if not Stream.isUserPrivateStream(astream)]
        writeable = Permission.writeableStreams(userId)
        allowed = set(shiftStreams).intersection(writeable)
        return len(allowed) > 0

    @classmethod
    def isPublic(cls, id):
        """
        Check where a shift is public.
        Parameters:
            id - a shift id.
        Returns:
            bool.
        """
        return Shift.load(core.connect, id) != None

    @classmethod
    def isPrivate(cls, id):
        """
        Check whether a shift is private.
        Parameters:
            id - a shift id.
        Returns:
            bool.
        """
        return not Shift.isPublic(id)

    # ========================================
    # Publishing
    # ========================================

    @classmethod
    def publish(id, publishData, userId):
        """
        Set draft status of a shift to false. Sync publishData field.
        If the shift is private only publish to the streams that
        the user has access. If the shift is publich publish it to
        any of the public non-user streams. Creates the comment stream
        if it doesn't already exist.
        Parameters:
            id - a shift id.
            publishData - a dictionary holding the publish options.
        """
        db = core.connect(User.private(userId))
        theShift = Shift.load(db, id)
        allowed = []
        publishStreams = publishData.get("streams") or []
        if (publishData.get("private") == True) or (publishData.get("private") == None and Shift.isPrivate(id)):
            allowedStreams = Permission.writeableStreams(userId)
            allowed = list(set(allowedStreams).intersection(set(publishStreams)))
            # add any private user streams this shift is directed to
            if publishData.get("users"):
                allowed.extend([SSUser.privateStream(SSUser.idForName(userName)) 
                                for userName in publishData["users"]
                                if SSUser.read(userName)])
                del publishData["users"]
            # add streams this user can post to
            allowed.extend([astream for astream in publishStreams
                            if Stream.canPost(astream, userId)])
        else:
            allowed.append(SSUser.publicStream(userId))
        # TODO: commentStreams should use the permission of the streams the shift has been published to. -David 7/14/09
        if not commentStream(id):
            streamId = Shift.createCommentStream(id)
            SSUser.addNotification(userId, streamId)
        # remove duplicates
        theShift.publishData.streams = list(set(allowed))
        if publishData.get("private"):
            theShift.publishData.private = publishData["private"]
        theShift.publishData.draft = False
        theShift.store(db)
        return Shift.joinData(theShift, userId)
    
    # ========================================
    # Comments
    # ========================================

    @classmethod
    def commentStream(id):
        """
        Return the comment stream id for the specified shift.
        Parameters:
            id - a shift id.
        """
        result = list(Stream.commentStream(key=id))
        if result and len(result) > 0:
            return result[0].id
        else:
            return None
    
    @classmethod
    def createCommentStream(id, streamId):
        """
        Create a comment stream for a shift if it doesn't already exist.
        Parameters:
            id - a shift id.
        """
        db = core.connect(Stream.group(streamId))
        theShift = Shift.load(db, id)
        commentStream = Stream.create(db, {
                "meta": "comments",
                "objectRef": ref(id),
                "createdBy": theShift.createdBy
                })
        return commentStream["_id"]

    # ========================================
    # Favoriting
    # ========================================

    def favoriteId(id, userId):
        """
        Return the favorite id for a shift and user.
        """
        return "favorite:%s:%s" % (userId, id)

    def isFavorited(id, userId=None):
        db = core.connect()
        favId = Shift.favoriteId(id, userId)
        return db.get(favId) != None
    
    def favorite(id, userId):
        db = core.connect()
        if (not Shift.canRead(id, userId)) or Shift.isFavorited(id, userId):
            return
        fav = {
            "created": utils.utctime(),
            "createdBy": userId,
            "type": "favorite"
            }
        db[favoriteId(id, userId)] = fav
        db = core.connect(User.private(userId))
        return Shift.joinData(Shift.load(db, id), userId)
    
    def unfavorite(id, userId):
        db = core.connect()
        if (not Shift.canRead(id, userId)) or (not Shift.isFavorited(id, userId)):
            return
        del db[Shift.favoriteId(id, userId)]
        return Shift.joinData(db[id], userId)
    
    def favoriteCount(id):
        return len(Favorite.by_shift(key=id)) or 0
    
    # ========================================
    # Lists & Filtering
    # ========================================