import unittest
import datetime
import server.models.core as core
from server.models.shiftschema import *
from server.models.ssuserschema import *


fakeMary = {
    "userName": "fakemary",
    "fullName": {
        "first":"Fake",
        "last": "Mary"
        },
    "email": "info@shiftspace.org",
    "displayName": "fakemary"
}


def shiftJson():
    return {
        "source": {
            "server":"http://localhost:5984/",
            "database":"shiftspace"
            },
        "href": "http://google.com/images",
        "space": {
            "name":"Notes",
            "version": "0.1"
            }
        }

class BasicOperations(unittest.TestCase):
    def setUp(self):
        db = core.connect()
        self.tempUser = SSUser.create(fakeMary)

    def testCreate(self):
        json = shiftJson()
        theShift = Shift.create(json, userId=self.tempUser.id)
        self.assertEqual(theShift.type, "shift")
        self.assertEqual(theShift.createdBy, self.tempUser.id)
        self.assertNotEqual(theShift.created, None)
        self.assertEqual(type(theShift.created), datetime)
        self.assertNotEqual(theShift.modified, None)
        self.assertEqual(type(theShift.modified), datetime)
        self.assertEqual(theShift.domain, "http://google.com")
        db = core.connect(SSUser.private(self.tempUser.id))
        del db[theShift.id]

    def testRead(self):
        json = shiftJson()
        newShift = Shift.create(json, userId=self.tempUser.id)
        theShift = Shift.read(newShift.id, userId=self.tempUser.id)
        self.assertEqual(theShift.source.server, newShift.source.server)
        self.assertEqual(theShift.source.database, newShift.source.database)
        self.assertEqual(theShift.createdBy, self.tempUser.id)
        db = core.connect(SSUser.private(self.tempUser.id))
        del db[theShift.id]

    def testUpdate(self):
        json = shiftJson()
        pass

    def testJoinData(self):
        json = shiftJson()
        newShift = Shift.create(json, userId=self.tempUser.id)
        self.assertNotEqual(newShift["gravatar"], None)

    def tearDown(self):
        db = core.connect()
        SSUser.delete(self.tempUser.userName)


class Utilities(unittest.TestCase):
    def testJoinData():
        pass

if __name__ == "__main__":
    unittest.main()